var request = require("request");
var webUtils = require("./webUtils");
var languageUtils = require("./languageUtils");

var rootUrl = "http://www.setlist.fm/";

// returns array of dictionaries with "name" and "link" keys
function searchForArtist(callback, error, url) {
	webUtils.fetchPageJqueryDom(
		function ($, window) {
			var artistNameSearchLinksList = [];
			$(".artistFacets").find('li').each(
				function(liIndex, item) {
					var a = $(item).find('a')[0];	
					var link = rootUrl + $(a).attr('href');
					var name = $(a).find('span')[0].innerHTML;
					artistNameSearchLinksList.push({'name':name, 'link':link});
				}
			);
			callback(artistNameSearchLinksList);
		},
		error,
		url
	);
}

function getArtistNameSearchLink(callback, error, artistName) {
	var url = "http://www.setlist.fm/search?query=" + artistName;
	searchForArtist(
		function (artistNameSearchLinksList) {
			callback( artistNameSearchLinksList[0] );
		}, 
		error,
		url
	);
}

function getSetlistsFromSearchLink(callback, error, artistSearchLink) {
	if (artistSearchLink == undefined) {
		error("Artist not found");
		return;
	}
	webUtils.fetchPageJqueryDom(
		function ($, window) {
			var setlists = [];
			$(".listSetlists").find(".setlistPreview").each(
				function(index, item) {
					var a = $($(item).find('h2')[0]).find('a')[0];
					var link = rootUrl + $(a).attr('href');
					var title = a.innerHTML;
					setlists.push( {'title':title, 'link':link} );
				}
			);
			callback(setlists);
		},
		error,
		artistSearchLink.link
	);
}

function getDetailsForSetlists(callback, error, setlists) {
	console.log("Getting details for " + setlists.length + " setlists");
	var toDo = setlists.length;
	var completed = 0;

	function done() {
		completed += 1;
		if (completed === toDo) {
			callback(setlists);
		}
	}
	for (var i = 0; i < setlists.length; i++) {
		getDetailsForSetlistObject(
			function(setlist) {
				done();
			},
			error,
			setlists[i]
		);
	};
}

// sets setlsit.songs and setlist.date
function getDetailsForSetlistObject(callback, error, setlist) {
	webUtils.fetchPageJqueryDom(
		function ($, window) {
			var songs = [];
			$(".setlistSongs").find("ol").find("li").each(
				function(index, item) {
					var songLinkTag = $(item).find(".songPart").find(".songLabel")[0];
					if (!songLinkTag) return;

					var songTitle = languageUtils.string.fixEncodingErrors(songLinkTag.innerHTML);
					var songStatsLink = rootUrl + $(songLinkTag).attr('href')
					songs.push( {'title':songTitle, 'statsLink':songStatsLink} );
				}
			);
			setlist.songs = songs;

			var month = $(".dateBlock").find(".m")[0].innerHTML;
			var day = $(".dateBlock").find(".d")[0].innerHTML;
			var year = $(".dateBlock").find(".y")[0].innerHTML;
			setlist.date = new Date(month + " " + day + ", " + year);
			callback(setlist);
		},
		error,
		setlist.link
	);
}

function normalizeSongTitle(name) {
	return name;
}

// This is the real secret sauce. Let's...  do something smarter later
function createHypotheticalSetlistFromPopulatedSetlists (callback, error, setlists) {
	var songsByPopularity = rankSongsByPlayCount( setlists );
	var songList = cutSongListToRightLength( songsByPopularity, setlists );
	songList = sortSongByAveragePosition( songList) ;

	callback(songList);
}

function rankSongsByPlayCount(setlists) {
	var songNameToSongObjectMap = {};
	for (var i = 0; i < setlists.length; i++) {
		var setlist = setlists[i];
		for (var j = 0; j < setlist.songs.length; j++) {
			var song = setlist.songs[j];
			var title = normalizeSongTitle(song.title);

			if (title in songNameToSongObjectMap) {
				song = songNameToSongObjectMap[title];
				song.averagePosition = ((song.averagePosition * song.playCount) + j) / (song.playCount + 1);
				song.playCount += 1;
			} else {
				songNameToSongObjectMap[title] = song;
				song.averagePosition = j;
				song.playCount = 1;
			}
		};
	};

	function playCountSort(a, b) {
		return b.playCount - a.playCount;
	}
	var songObjectsWithPlayCounts = languageUtils.dictionaryValues(songNameToSongObjectMap);
	songObjectsWithPlayCounts.sort(playCountSort);
	return songObjectsWithPlayCounts;
}

function cutSongListToRightLength(songList, setlists) {
	//var idealLength = 15;
	var meanLength = languageUtils.meanLengthOfNonEmptyArrayAtKeyOnObjects('songs', setlists);
	var standardDeviationOfLength = languageUtils.standadDeviationOfLengthOfNonEmptyArrayAtKeyOnObjects('songs', setlists);
	console.log("Mean Length: " + meanLength);
	console.log("Standard Dev Length: " + standardDeviationOfLength);

	// sort of arbitrary: basically, don't ignore songs you'd likely want to know
	var idealLength = Math.ceil(meanLength + standardDeviationOfLength);

	songList = songList.slice(0, idealLength);
	return songList;
}

function sortSongByAveragePosition(songList) {
	function averagePositionSort(a, b) {
		return a.averagePosition - b.averagePosition;
	}
	songList.sort(averagePositionSort);
	return songList;
}

function createSetlistForArtistName(callback, error, artistName) {
	getArtistNameSearchLink (
		function (artistNameSearchLink) {		
			getSetlistsFromSearchLink (
				function (setlists) {					
					getDetailsForSetlists (
						function (setlists) {
							createHypotheticalSetlistFromPopulatedSetlists(
								function (newSetlist) {
									callback(newSetlist);
								},
								function (e) {
									console.log(e.toString());
								},
								setlists
							);
						},
						function (e) {
							console.log("Failed on single setlist parsing");
							error(e);
						},
						setlists
					);
				},
				function (e) {
					console.log("Error in getSetlistsFromSearchLink");
					error(e);
				},
				artistNameSearchLink
			);
		},
		function (e) {
			console.log("Error in getArtistNameSearchLink");
			error(e);
		},
		artistName
	);
}
exports.createSetlistForArtistName = createSetlistForArtistName;

function test() {
	var artistName = "The National";
	createSetlistForArtistName(
		function (setlist) {
			console.log(setlist);
		},
		function (e) {
			console.log(e);
		},
		artistName
	);
}
//test();

//// TRACK search
// {
//     "info": {
//         "num_results": 425,
//         "limit": 100,
//         "offset": 0,
//         "query": "kaizers orchestra",
//         "type": "track",
//         "page": 1
//     },
//     "tracks": [
//         {
//             "album": {
//                 "released": "2010",
//                 "href": "spotify:album:5AN6A9IR1g1xRgY0RoKOsT",
//                 "name": "Hjerteknuser",
//                 "availability": {
//                     "territories": "NO"
//                 }
//             },
//             "name": "Hjerteknuser",
//             "popularity": "0.63",
//             "external-ids": [
//                 {
//                     "type": "isrc",
//                     "id": "NOHDL1002070"
//                 }
//             ],
//             "length": 199.407,
//             "href": "spotify:track:6dKWi7apHjn2W7Ojncv4Wu",
//             "artists": [
//                 {
//                     "href": "spotify:artist:1s1DnVoBDfp3jxjjew8cBR",
//                     "name": "Kaizers Orchestra"
//                 }
//             ],
//             "track-number": "1"
//         }
//     ]
// }

//// ARTIST search
// {
//     "info": {
//         "num_results": 21,
//         "limit": 100,
//         "offset": 0,
//         "query": "nirvana",
//         "type": "artist",
//         "page": 1
//     },
//     "artists": [
//         {
//             "href": "spotify:artist:6olE6TJLqED3rqDCT0FyPh",
//             "name": "Nirvana",
//             "popularity": "0.66"
//         },
//         {
//             "href": "spotify:artist:3sS2Q1UZuUXL7TZSbQumDI",
//             "name": "Approaching Nirvana",
//             "popularity": "0.31"
//         }
//     ]
// }
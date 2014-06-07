var request = require("request");
var webUtils = require("./webUtils");
var languageUtils = require("./languageUtils");
var echonestApi = require("./echonestApi");

var rootUrl = "http://www.setlist.fm/";

// callback with {'name': , 'musicbrainzId': , 'spotifyId': }
function getArtistProperNameAndIds(callback, error, artistName) {
	echonestApi.artistLimitedProfile(
		function(echonestArtist) {
			if (echonestArtist == null) {
				error("Artist not found");
				return;
			}
			var name = echonestArtist.name;
			var musicbrainzId = echonestApi.extractMusicbrainzId(echonestArtist);
			var spotifyId = echonestApi.extractSpotifyId(echonestArtist);
			callback({'name':name, 'musicbrainzId':musicbrainzId, 'spotifyId': spotifyId});
		},
		error,
		artistName
	);
}

// artistWithIds is {'name': , 'musicbrainzId': , 'spotifyId': }
// callsback with setlists as defined by setlist.fm
function getRawSetlistsFromArtistWithIds(callback, error, artistWithIds) {
	if (artistWithIds.musicbrainzId == undefined) {
		error("Artist not found: " + artistWithIds);
		return;
	}

	var uri = "http://api.setlist.fm/rest/0.1/artist/" + artistWithIds.musicbrainzId + "/setlists.json";

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			var body;
			try {
				body = JSON.parse(rawBody);
			} catch (e) {
				console.log("Error parsing setlist json");
				console.log(rawBody);
				error(e);
				return;
			}
			var setlistObjects = body.setlists.setlist;
			callback(setlistObjects);
		}
	);
}

function rawSetlistContainsSongs(rawSetlist) {
	return rawSetlist.sets != "";
}

/* Reformat to have:
 *  {   
 *      date:
 *      songs: [ { title: } ]
 *  }
*/
function processSetlists(callback, error, rawSetlists) {
	var processedSetlists = [];

	var mostWorthCounting = Math.min(10,rawSetlists.length);
	for (var i = 0; i < rawSetlists.length; i++) {
		var rawSetlist = rawSetlists[i];
		
		if (!(rawSetlistContainsSongs(rawSetlist))) { continue; }

		var processedSetlist = processSetlist(rawSetlist);
		processedSetlists.push(processedSetlist);
		if (processedSetlists.length == mostWorthCounting) {
			break;
		}
	};
	//console.log(processedSetlists);
	callback(processedSetlists);
}

// take "24-05-2014" return new Date("05-24-2014")
function getDateFromRawSetlist(rawSetlist) {
	try {
		var euroDateOrderedParts = rawSetlist["@eventDate"].split('-');
		var usDateString = euroDateOrderedParts[1] + "-" + euroDateOrderedParts[0] + "-" + euroDateOrderedParts[2];
		return new Date(usDateString);
	} catch (e) {
		return null;
	}
}

// sets setlist.songs and setlist.date
function processSetlist(rawSetlist) {
	var songs = [];
	var sets = rawSetlist.sets.set;
	if (sets.length === undefined) {
		var rawSongs = sets.song;
		for (var i = 0; i < rawSongs.length; i++) {
			songs.push({'title':rawSongs[i]["@name"]});
			//songs.push(rawSongs[i]["@name"]);
		};
	}
	else {
		for (var i = 0; i < sets.length; i++) {
			var set = sets[i];
			var rawSongs = set.song;
			for (var i = 0; i < rawSongs.length; i++) {
				songs.push({'title':rawSongs[i]["@name"]});
				//songs.push(rawSongs[i]["@name"]);
			};
		};
	}
	if (songs.length == 0) {
		console.log(sets);
		console.log("$$$$$$$$$$$$$$$$$$$$$$$");
	}
	return { 'songs': songs, 'date' : getDateFromRawSetlist(rawSetlist) };
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
	console.log(setlists.length);
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
	var meanLength = languageUtils.meanLengthOfNonEmptyArrayAtKeyOnObjects('songs', setlists);
	var standardDeviationOfLength = languageUtils.standadDeviationOfLengthOfNonEmptyArrayAtKeyOnObjects('songs', setlists);
	console.log("Mean Length: " + meanLength);
	console.log("Standard Dev Length: " + standardDeviationOfLength);

	// sort of arbitrary: basically, don't ignore songs you'd likely want to know
	var idealLength = Math.ceil(meanLength + standardDeviationOfLength);
	console.log("Trimming to length: " + idealLength);

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
	getArtistProperNameAndIds(
		function (artistWithIds){
			getRawSetlistsFromArtistWithIds(
				function (rawSetlists) {
					//console.log(rawSetlists);
					processSetlists(
						function (setlists) {
							createHypotheticalSetlistFromPopulatedSetlists(
								function (newSetlist) {
									callback(newSetlist);
								},
								function (e) {
									console.log("Error in createHypotheticalSetlistFromPopulatedSetlists");
									error(e);
								},
								setlists
							);
						},
						function (e) {
							console.log("Error in processSetlists");
							error(e);
						},
						rawSetlists
					);
				},
				function (e) {
					console.log("Error in getRawSetlistsFromArtistWithIds");
					error(e);
				},
				artistWithIds
			);
		},
		function (e) { 
			console.log("Error in getArtistProperNameAndIds");
			error(e);
		},
		artistName
	);
}
exports.createSetlistForArtistName = createSetlistForArtistName;


function test() {
	var artistName = "The National";

	createSetlistForArtistName(
		function(setlist) {
			console.log(setlist);
		},
		function (e) {
			console.log(e);
		},
		artistName
	);
}
//test();

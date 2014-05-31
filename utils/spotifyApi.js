var request = require("request");
var languageUtils = require("./languageUtils");

function searchForTrackByArtistName(callback, error, track, artistName) {
	var query = encodeURIComponent(track + " " + artistName);
	var uri = "http://ws.spotify.com/search/1/track.json?q=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			var body = JSON.parse(rawBody);
			callback(body.tracks);
		}
	);
}
exports.searchForTrackByArtistName = searchForTrackByArtistName;

function findTrackByTitleAndArtistName(callback, error, track, artistName) {
	searchForTrackByArtistName(
		function(guesses) {
			var badGuess;
			for (var i = 0; i < guesses.length; i++) {
				var guess = guesses[i];
				if (languageUtils.string.areNoisyEqual( guess.name, track )) {
					// track name matches
					if (languageUtils.string.areNoisyEqual( guess.artists[0].name, artistName )) {
						// and artist name matches: same song
						var song = {'title': guess.name, 'spotifyUri': guess.href}
						console.log(song);
						callback(song);
						return;
					} else {
						if (badGuess == null) {
							badGuess = guess;
						}
					}
				}
			}
			callback(badGuess);
		},
		error,
		track,
		artistName
	);
}
exports.findTrackByTitleAndArtistName = findTrackByTitleAndArtistName;

function addTrackDataToSongWithArtistName(callback, error, song, artistName) {
	findTrackByTitleAndArtistName(
		function (track) {
			if (track === null || track === undefined) {
				console.log("Couldn't find " + song.title + " by " + artistName);
				song.onSpotify = false;
			} else {
				song.title = track.title;
				song.spotifyUri = track.spotifyUri;
				song.onSpotify = true;
			}
			callback(song);
		},
		error,
		song.title,
		artistName
	);
}
exports.addTrackDataToSongWithArtistName = addTrackDataToSongWithArtistName;

function addTrackDataToSongsWithArtistName(callback, error, songs, artistName) {
	var toDo = songs.length;
	var completed = 0;

	function done() {
		completed += 1;
		if (completed === toDo) {
			callback(songs);
		}
	}
	for (var i = 0; i < songs.length; i++) {
		addTrackDataToSongWithArtistName(
			function(song) {
				done();
			},
			error,
			songs[i],
			artistName
		);
	};
}
exports.addTrackDataToSongsWithArtistName = addTrackDataToSongsWithArtistName;

function searchForTrack(callback, error, query) {
	if (query.charAt(0) != '"') {
		query = '"' + query + '"';
	}
	var uri = "http://ws.spotify.com/search/1/track.json?q=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			var body = JSON.parse(rawBody);
			callback(body.tracks);
		}
	);
}
exports.searchForTrack = searchForTrack;

function searchForArtist(callback, error, query) {
	if (query.charAt(0) != '"') {
		query = '"' + query + '"';
	}
	var uri = "http://ws.spotify.com/search/1/artist.json?q=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			var body = JSON.parse(rawBody);
			callback(body.artists);
		}
	);
}
exports.searchForArtist = searchForArtist;

function test() {
	findTracksByTitleAndArtistName(
		function(song) {		
			console.log(song);
		},
		function(e) {
			console.log("Error! " + e.toString());
		},
		["I Should Live In Salt", "Don't Swallow The Cap"],
		"The National"
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
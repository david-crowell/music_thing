var request = require("request");
var languageUtils = require("./languageUtils");

function searchForTrackByArtistName(callback, error, track, artistName) {
	var query = encodeURIComponent(track + " " + artistName);
	var uri = "http://api.spotify.com/v1/search?type=track&q=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			try {
				var body = JSON.parse(rawBody);
				callback(body.tracks.items);
			} 
			catch(e) {
				console.log(e);
				console.log(body);
				error(e);
			}
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
						var song = {'title': guess.name, 'spotifyUri': guess.uri}
						callback(song);
						return;
					} else {
						if (badGuess === null || badGuess === undefined) {
							badGuess = guess;
						}
					}
				}
			}
			if (badGuess === null || badGuess === undefined) {
				callback(null);
				return;
			};
			var song = {'title': badGuess.name, 'spotifyUri': badGuess.uri}
			callback(song);
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
			callback();
			songs = null;
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
	var uri = "https://api.spotify.com/v1/search?type=track&q=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			console.log(rawBody);
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
	var uri = "https://api.spotify.com/v1/search?type=artist&q=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			var body = JSON.parse(rawBody);
			callback(body.artists.items);
		}
	);
}
exports.searchForArtist = searchForArtist;

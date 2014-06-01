var echonestApi = require('../utils/echonestApi.js');
var setlistApi = require('../utils/setlistApi.js');
var spotifyApi = require('../utils/spotifyApi.js');

function cleanSongObject(song) {
	delete song.statsLink;
	delete song.playCount;
	delete song.averagePosition;
	return song;
}

function createSetlist(request, response) {
	var artistName = request.query.artistName;
	var artistSpotifyId = request.query.artistSpotifyId;

	if (artistName != undefined && artistName != null) {
		// we're going by artistName 
		createSetlistOfSongs(
			function (setlist) {
				response.send(setlist);
				delete setlist;
				setlist = null;
				return;
			},
			function (e) {
				console.log("ERROR");
				console.log(e.toString());
				response.send(e.toString());
			},
			artistName,
			null
		);
	} else if (artistSpotifyId != undefined && artistSpotifyId != null) {
		response.send("Not yet implemented!");
	} else {
		response.send("Must supply artistName or artistSpotifyId query parameter");
	}
}
exports.createSetlist = createSetlist;

function createSetlistOfSongs(callback, error, artistName, artistSpotifyId) {
	// we're going by artistName 
	setlistApi.createSetlistForArtistName(
		function (setlist) {
			//response.send(setlist);
			console.log("Got setlist");
			spotifyApi.addTrackDataToSongsWithArtistName(
				function () {
					for (var i = 0; i < setlist.length; i++) {
						var song = setlist[i];
						cleanSongObject(song);
						setlist[i] = song;
					};
					callback(setlist);
					return;
					//response.send(setlist);
				},
				function (e) {
					console.log("ERROR");
					console.log(e.toString());
					error(e);
					return;
					//response.send(e.toString());
				}, 
				setlist,
				artistName
			);
		},
		function (e) {
			console.log("ERROR");
			console.log(e.toString());
			//response.send(e.toString());
			error(e);
			return;
		},
		artistName
	);
}

function getEmbedCodeForSetlist(request, response) {
	var artistName = request.query.artistName;
	var artistSpotifyId = request.query.artistSpotifyId;
	createSetlistOfSongs(
		function (setlist) {
			var uri = "http://embed.spotify.com/?uri=spotify:trackset:" + encodeURIComponent(artistName + " Setlist") + ":";
			for (var i = 0; i < setlist.length; i++) {
			    var song = setlist[i];
			    if (song.onSpotify == false) continue;
			    
			    var spotifyId = song.spotifyUri.split(':').pop();
			    uri += spotifyId;

			    if (i <= setlist.length - 2) {
			        // it's not the last one
			        uri += ",";
			    }
			};
			response.send(uri);
			delete setlist;
		},
		function (e) {
			response.send("Blame Dave for this one");
		},
		artistName
	);
}
exports.getEmbedCodeForSetlist = getEmbedCodeForSetlist;
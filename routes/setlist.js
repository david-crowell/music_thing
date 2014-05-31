var echonestApi = require('../utils/echonestApi.js');
var setlistScraper = require('../utils/setlistScraper.js');
var spotifyApi = require('../utils/spotifyApi.js');

function cleanSongObject(song) {
	delete song.statsLink;
	return song;
}

function createSetlist(request, response) {
	var artistName = request.query.artistName;
	var artistSpotifyId = request.query.artistSpotifyId;

	if (artistName != undefined && artistName != null) {
		// we're going by artistName 
		setlistScraper.createSetlistForArtistName(
			function (setlist) {
				//response.send(setlist);
				console.log("Got setlist");
				spotifyApi.addTrackDataToSongsWithArtistName(
					function (setlist) {
						for (var i = 0; i < setlist.length; i++) {
							var song = setlist[i];
							cleanSongObject(song);
							setlist[i] = song;
						};
						response.send(setlist);
					},
					function (e) {
						console.log("ERROR");
						console.log(e.toString());
						response.send(e.toString());
					}, 
					setlist,
					artistName
				);
			},
			function (e) {
				console.log("ERROR");
				console.log(e.toString());
				response.send(e.toString());
			},
			artistName
		);
	} else if (artistSpotifyId != undefined && artistSpotifyId != null) {
		response.send("Not yet implemented!");
	} else {
		response.send("Must supply artistName or artistSpotifyId query parameter");
	}
}
exports.createSetlist = createSetlist;

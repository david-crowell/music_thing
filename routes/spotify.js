var spotifyApi = require('../utils/spotifyApi.js');

function artist(request, response) {
	var query = request.query.q;

	spotifyApi.searchForArtist(
		function(artists) {
			response.send(artists);
		},
		function(e) {
			console.log("ERROR");
			console.log(e.toString());
			response.send(e.toString());
		},
		query
	);
}
exports.artist = artist;
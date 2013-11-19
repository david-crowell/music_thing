var spotifyApi = require('../utils/spotifyApi.js');

function getArtist(request, response) {
	var query = request.query.q;

	spotifyApi.searchForArtist(
		query,
		function(artists) {
			console.log("Success");
			response.send(artists);
		},
		function(e) {
			console.log("ERROR");
			console.log(e.toString());
			response.send(e.toString());
		}
	);
}
exports.getArtist = getArtist;
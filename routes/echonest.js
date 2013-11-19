var echonestApi = require('../utils/echonestApi.js');

function suggest(request, response) {
	var query = request.query.q;

	echonestApi.suggestArtists(
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
exports.suggest = suggest;
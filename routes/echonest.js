var echonestApi = require('../utils/echonestApi.js');

function suggest(request, response) {
	var query = request.query.q;

	echonestApi.suggestArtists(		
		function(artists) {
			console.log("Success");
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
exports.suggest = suggest;

function similar(request, response) {
	var query = request.query.q;

	echonestApi.similarArtists(	
		function(artists) {
			console.log("Success");
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
exports.similar = similar;
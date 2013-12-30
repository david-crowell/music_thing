var lastFmApi = require('../utils/lastFmApi.js');

function tags(request, response) {
	var body = request.body;
	console.log(body);
	var artists = body.artists;
	lastFmApi.getTagsForArtists(
		function(tags){
			console.log(tags);
			response.send(tags);
		},
		function(e){
			console.log("ERROR");
			console.log(e.toString());
			response.send(e.toString());
		},
		artists
	);
	/*
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
	*/
}
exports.tags = tags;

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
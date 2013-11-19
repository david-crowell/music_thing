var request = require('request');
var config = require('../config.js');
var API_KEY = config.echonestApiKey;

function similarArtistNames(query, callback, error) {
	var uri = "http://developer.echonest.com/api/v4/artist/similar?api_key=" + API_KEY + "&format=json&results=20&start=0&name=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}

			var body = JSON.parse(rawBody);
			var artists = [];

			for (var i = 0; i < body.response.artists.length; i++) {
				artists.push(body.response.artists[i].name);
			}

			callback(artists);
		}
	);
}
exports.similarArtistNames = similarArtistNames;
//{"response": {"status": {"version": "4.2", "code": 0, "message": "Success"}, "artists": [{"id": "ARH1N081187B9AC562", "name": "Thom Yorke"}, {"id": "ARW64KS1187FB3C94D", "name": "Doves"}, {"id": "AR0L04E1187B9AE90C", "name": "The Verve"}, {"id": "ARTNON61187B98D6EE", "name": "Elbow"}, {"id": "ARZ0RS81187B98F252", "name": "Mercury Rev"}, {"id": "ARKVITV1187B9AE854", "name": "Blur"}, {"id": "ARZNOIY1187B989D9C", "name": "On a Friday"}, {"id": "ARR3ONV1187B9A2F59", "name": "Muse"}, {"id": "ARIIMPS1187FB4CD03", "name": "Richard Ashcroft"}, {"id": "ARGEJ8B1187B9AE2E7", "name": "Manic Street Preachers"}, {"id": "ARG7LMD1187FB4B064", "name": "Mansun"}, {"id": "ARJ7KF01187B98D717", "name": "Coldplay"}, {"id": "ARHRMYH1187B9A675B", "name": "Mew"}, {"id": "ARA1OFS1187B9AE656", "name": "British Sea Power"}, {"id": "ARC2XR11187FB5CC95", "name": "Beck"}, {"id": "ARHHUDL1187B997966", "name": "Keane"}, {"id": "ARCMOKD1187B9AEB21", "name": "Starsailor"}, {"id": "ARNVCB81187B9ACBDF", "name": "The Flaming Lips"}, {"id": "AR2A6UJ1187FB4BF5C", "name": "The Good, the Bad & the Queen"}, {"id": "ARDW3YJ1187FB4CCE5", "name": "Athlete"}]}}

function suggestArtists(query, callback, error) {
	var uri = "http://developer.echonest.com/api/v4/artist/suggest?api_key=" + API_KEY + "&results=20&name=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			
			var body = JSON.parse(rawBody);
			var artists = [];

			for (var i = 0; i < body.response.artists.length; i++) {
				artists.push(body.response.artists[i].name);
			}

			callback(artists);
		}
	);
}
exports.suggestArtists = suggestArtists;
//{"response": {"status": {"version": "4.2", "code": 0, "message": "Success"}, "artists": [{"name": "Radiohead", "id": "ARH6W4X1187B99274F"}, {"name": "Wonky vs. Radiohead", "id": "AR26WWW1187FB40070"}, {"name": "Radiohead Lullabies", "id": "ARHYPRQ11F4C83D230"}, {"name": "Radiohead Tribute", "id": "ARMLGGK13A23CD1318"}, {"name": "Radiohead Tribute - Meeting in the Aisle", "id": "ARVOZQT11E8F5C12BA"}, {"name": "Radioheadheadheadheadhead", "id": "ARPMOVZ126DD9A5A25"}, {"name": "Meeting in the Aisle: a Tribute to the Music of Radiohead", "id": "ARVGJEW11E8F5C0E4E"}, {"name": "Radioheadheadhead", "id": "ARKVYRS126DD652B02"}, {"name": "Rhythms Del Mundo feat El Lele De Los Van Van and Radiohead", "id": "ARSUMDD13FE9646A84"}]}}

function test() {
	suggestArtists("Radio",
		function(artists) {		
			console.log(artists);
			//console.log(tracks.length + " results!");
		},
		function(e) {
			console.log("Error! " + e.toString());
		}
	);
}
//test();
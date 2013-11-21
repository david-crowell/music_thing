var seatgeekApi = require('../utils/seatgeekApi.js');

function getEvents(request, response) {
	var query = request.query.q;

	var ip = request.connection.remoteAddress;
	console.log(ip);
	if (ip === "127.0.0.1") { ip = "18.10.0.1";} //generic MIT-block address

	seatgeekApi.findSeatGeekEventsForArtist(		
		function(events) {
			console.log("Success");
			response.send(events);
		},
		function(e) {
			console.log("ERROR");
			console.log(e.toString());
			response.send(e.toString());
		},
		query,
		ip
	);
}
exports.getEvents = getEvents;
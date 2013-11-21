var seatgeekApi = require('../utils/seatgeekApi.js');

function getEvents(request, response) {
	var query = request.query.q;

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
		query
	);
}
exports.getEvents = getEvents;
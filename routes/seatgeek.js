var seatgeekApi = require('../utils/seatgeekApi.js');

function getArtistEvents(request, response) {
	var query = request.query.q;

	var ip = getClientIp(request);
	console.log(ip);
	if (ip === "127.0.0.1") { ip = "18.10.0.1";} //generic MIT-block address

	var payload = {};

	var toDo = 2; //mirror call count below
	var did = 0;
	function done() {
		did += 1;
		if (did >= toDo) {
			console.log("Success");
			response.send(payload);
		}
	}

	seatgeekApi.findSeatGeekEventsForArtistNearIp(		
		function(events) {
			console.log("Success");
			payload.sameArtistNearbyPerformances = events;
			done();
		},
		function(e) {
			console.log("ERROR");
			console.log(e.toString());
			payload.sameArtistNearbyPerformances = [];
			done();
		},
		query,
		ip
	);

	seatgeekApi.findAllSeatGeekEventsForArtist(		
		function(events) {
			console.log("Success");
			payload.sameArtistAllPerformances = events;
			done();
		},
		function(e) {
			console.log("ERROR");
			console.log(e.toString());
			payload.sameArtistAllPerformances = [];
			done();
		},
		query		
	);
}
exports.getArtistEvents = getArtistEvents;

function getLocalEvents(request, response) {	
	if (request.query.postal_code) {
		getLocalEventsByPostalCode(request, response);
	} else {
		getLocalEventsByIp(request, response);
	}
}
exports.getLocalEvents = getLocalEvents;

function getLocalEventsByPostalCode(request, response) {
	var postal_code = request.query.postal_code;
	console.log(postal_code);

	seatgeekApi.findSeatGeekEventsNearPostalCode(		
		function(events) {
			console.log("Success");
			response.send( events );
		},
		function(e) {
			console.log("ERROR");
			console.log(e.toString());
			response.send( [] );
		},
		postal_code
	);
}

function getLocalEventsByIp(request, response) {

	var ip = getClientIp(request);
	console.log(ip);
	if (ip === "127.0.0.1") { ip = "18.10.0.1";} //generic MIT-block address

	seatgeekApi.findSeatGeekEventsNearIp(		
		function(events) {
			console.log("Success");
			response.send( events );
		},
		function(e) {
			console.log("ERROR");
			console.log(e.toString());
			response.send( [] );
		},
		ip
	);
}

function getClientIp(req) {
	var ipAddress;
	// Amazon EC2 / Heroku workaround to get real client IP
	var forwardedIpsStr = req.header('x-forwarded-for'); 
	if (forwardedIpsStr) {
    	var forwardedIps = forwardedIpsStr.split(',');
	    ipAddress = forwardedIps[0];
	}
	if (!ipAddress) {
	    ipAddress = req.connection.remoteAddress;
	  }
	return ipAddress;
};
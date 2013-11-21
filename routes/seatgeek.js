var seatgeekApi = require('../utils/seatgeekApi.js');

function getEvents(request, response) {
	var query = request.query.q;

	var ip = getClientIp(request);
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
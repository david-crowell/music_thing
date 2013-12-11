var request = require('request');
var config = require('../config.js');
var utils = require('../public/js/utils.js');
var CLIENT_ID = config.seatgeekClientId;

function findSeatGeekEventsForArtistNearIp(callback, error, artistName, ip) {	
	var searchUrl = "http://api.seatgeek.com/2/events?taxonomies.name=concert&per_page=100&range=100mi&geoip=" + ip;	
	var name = artistName.replace(/&amp;/g, "&");
	if (name.charAt(0) != '"') {
		name = '"' + name + '"';
	}

	var artistTerm = encodeURIComponent(name);	

	searchUrl = searchUrl + "&q=" + artistTerm;

	console.log(searchUrl);

	request(searchUrl, function(err, response, body) {
		if (err) { error(err); return; }
		data = JSON.parse(body);
		if (data["events"].length == 0 ) {
			console.log("Failed with 0 results: " + artistName + " , " + artistTerm);
			callback([]);
		} else {
			var events = data.events;
			console.log("Pre-filtering events: " + events.length);
			events = filterEvents(events, artistName);
			console.log("Post-filtering events: " + events.length);
			callback(events);
		}
	});
}
exports.findSeatGeekEventsForArtistNearIp = findSeatGeekEventsForArtistNearIp;

function findAllSeatGeekEventsForArtist(callback, error, artistName) {
	findSeatGeekEventsForArtistNearIp(callback, error, artistName, '10.0.0.1');
}
exports.findAllSeatGeekEventsForArtist = findAllSeatGeekEventsForArtist;

function filterEvents(events, artistName) {
	var filtered = [];
	for (var i = 0; i < events.length; i++) {
		var event = events[i];
		var matches = false;
		for (var j = 0; j < event.performers.length; j++) {
			var performer = event.performers[j];
			if ( utils.bandNamesAreEqual( artistName, performer.name ) || utils.bandNamesAreEqual( artistName, performer.short_name )) {
				matches = true;
				break;
			}
		};
		if (matches) {
			filtered.push(event);
		}
	};
	return filtered;
}
//{"meta":{"per_page":5,"total":12,"geolocation":null,"took":12,"page":1},"events":[{"links":[],"id":1801756,"stats":{"listing_count":1,"average_price":45,"lowest_price":45,"highest_price":45},"title":"Grouplove","score":0.46243,"date_tbd":false,"type":"concert","datetime_local":"2013-11-22T19:00:00","time_tbd":false,"taxonomies":[{"parent_id":null,"id":2000000,"name":"concert"}],"performers":[{"name":"Grouplove","short_name":"Grouplove","url":"http://seatgeek.com/grouplove-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg","primary":true,"slug":"grouplove","score":0.51656,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg"},"id":8987}],"url":"http://seatgeek.com/grouplove-tickets/london-boston-arms-2013-11-22-7-pm/concert/1801756/","venue":{"city":"London","name":"Boston Arms","extended_address":"London, UK","url":"http://seatgeek.com/venues/boston-arms/tickets/","country":"UK","display_location":"London, UK","links":[],"slug":"boston-arms","state":"London","score":0.27157,"postal_code":"N19 5QQ","location":{"lat":51.557,"lon":-0.13833},"address":"178 Junction Road","id":10326},"short_title":"Grouplove","datetime_utc":"2013-11-22T19:00:00","general_admission":true,"datetime_tbd":false},{"links":[],"id":1801551,"stats":{"listing_count":0,"average_price":null,"lowest_price":null,"highest_price":null},"title":"Grouplove","score":0.46239,"date_tbd":false,"type":"concert","datetime_local":"2013-11-23T19:00:00","time_tbd":false,"taxonomies":[{"parent_id":null,"id":2000000,"name":"concert"}],"performers":[{"name":"Grouplove","short_name":"Grouplove","url":"http://seatgeek.com/grouplove-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg","primary":true,"slug":"grouplove","score":0.51656,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg"},"id":8987}],"url":"http://seatgeek.com/grouplove-tickets/london-the-slaughtered-lamb-london-2013-11-23-7-pm/concert/1801551/","venue":{"city":"London","name":"The Slaughtered Lamb London","extended_address":"London, UK","url":"http://seatgeek.com/venues/the-slaughtered-lamb-london/tickets/","country":"UK","display_location":"London, UK","links":[],"slug":"the-slaughtered-lamb-london","state":"London","score":0,"postal_code":"EC1V 0DX","location":{"lat":51.5232,"lon":-0.10118},"address":"34 Great Sutton Street","id":9509},"short_title":"Grouplove","datetime_utc":"2013-11-23T19:00:00","general_admission":true,"datetime_tbd":false},{"links":[],"id":1617156,"stats":{"listing_count":28,"average_price":200,"lowest_price":60,"highest_price":338},"title":"Imagine Dragons with Grouplove","score":0.56468,"date_tbd":false,"type":"concert","datetime_local":"2013-11-26T19:00:00","time_tbd":false,"taxonomies":[{"parent_id":null,"id":2000000,"name":"concert"}],"performers":[{"name":"Grouplove","short_name":"Grouplove","url":"http://seatgeek.com/grouplove-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg","slug":"grouplove","score":0.51656,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg"},"id":8987},{"name":"Imagine Dragons","short_name":"Imagine Dragons","url":"http://seatgeek.com/imagine-dragons-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/imagine-dragons-948874/15150/huge.jpg","primary":true,"slug":"imagine-dragons","score":0.62707,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/imagine-dragons-948874/15150/huge.jpg"},"id":15150}],"url":"http://seatgeek.com/imagine-dragons-with-grouplove-tickets/london-o2-academy-brixton-2013-11-26-7-pm/concert/1617156/","venue":{"city":"London","name":"O2 Academy Brixton","extended_address":"London, UK","url":"http://seatgeek.com/venues/o2-academy-brixton/tickets/","country":"UK","display_location":"London, UK","links":[],"slug":"o2-academy-brixton","state":"London","score":0.52631,"postal_code":"SW9 9SL","location":{"lat":51.4655,"lon":-0.11584},"address":"211 Stockwell Road","id":3253},"short_title":"Imagine Dragons with Grouplove","datetime_utc":"2013-11-26T19:00:00","datetime_tbd":false},{"links":[],"id":1792994,"stats":{"listing_count":18,"average_price":89.5,"lowest_price":61.0,"highest_price":197.0},"title":"Manchester Orchestra with Justin Townes Earle and Harrison Hudson and The Stuffing and The Wild","score":0.48568,"date_tbd":false,"type":"concert","datetime_local":"2013-11-26T17:30:00","time_tbd":false,"taxonomies":[{"parent_id":null,"id":2000000,"name":"concert"}],"performers":[{"name":"Kevin Devine","short_name":"Kevin Devine","url":"http://seatgeek.com/kevin-devine-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/kevin-devine-903463/1050/huge.jpg","slug":"kevin-devine","score":0.41256,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/kevin-devine-903463/1050/huge.jpg","medium":"http://cdn.chairnerd.com/images/performers/1050/kevin-devine-94f275/medium.jpg","large":"http://cdn.chairnerd.com/images/performers/1050/kevin-devine-870f53/large.jpg","small":"http://cdn.chairnerd.com/images/performers/1050/kevin-devine-78b029/small.jpg"},"id":1050},{"name":"Manchester Orchestra","short_name":"Manchester Orchestra","url":"http://seatgeek.com/manchester-orchestra-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/manchester-orchestra-41b2da/1179/huge.jpg","primary":true,"slug":"manchester-orchestra","score":0.48939,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/manchester-orchestra-41b2da/1179/huge.jpg","medium":"http://cdn.chairnerd.com/images/performers/1179/manchester-orchestra-c5d770/medium.jpg","large":"http://cdn.chairnerd.com/images/performers/1179/manchester-orchestra-451418/large.jpg","small":"http://cdn.chairnerd.com/images/performers/1179/manchester-orchestra-c8e806/small.jpg"},"id":1179},{"name":"Justin Townes Earle","short_name":"Justin Townes Earle","url":"http://seatgeek.com/justin-townes-earle-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/justin-townes-earle-0374f4/4360/huge.jpg","slug":"justin-townes-earle","score":0.46103,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/justin-townes-earle-0374f4/4360/huge.jpg","medium":"http://cdn.chairnerd.com/images/performers/4360/justin-townes-earle-f99387/medium.jpg","large":"http://cdn.chairnerd.com/images/performers/4360/justin-townes-earle-6f014a/large.jpg","small":"http://cdn.chairnerd.com/images/performers/4360/justin-townes-earle-6500cc/small.jpg"},"id":4360},{"name":"Grouplove","short_name":"Grouplove","url":"http://seatgeek.com/grouplove-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg","slug":"grouplove","score":0.51656,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg"},"id":8987},{"name":"Sleeper Agent","short_name":"Sleeper Agent","url":"http://seatgeek.com/sleeper-agent-tickets","type":"band","image":null,"slug":"sleeper-agent","score":0.31807,"images":{},"id":12592},{"name":"Robert Ellis","short_name":"Robert Ellis","url":"http://seatgeek.com/robert-ellis-tickets","type":"band","image":null,"slug":"robert-ellis","score":0.48084,"images":{},"id":19445},{"name":"The Front Bottoms","short_name":"The Front Bottoms","url":"http://seatgeek.com/the-front-bottoms-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/the-front-bottoms-b01aec/19461/huge.jpg","slug":"the-front-bottoms","score":0.41409,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/the-front-bottoms-b01aec/19461/huge.jpg"},"id":19461},{"name":"O'Brother","short_name":"O'Brother","url":"http://seatgeek.com/o-brother-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/o-brother-c293e1/20574/huge.jpg","slug":"o-brother","score":0.58932,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/o-brother-c293e1/20574/huge.jpg"},"id":20574},{"name":"All Get Out","short_name":"All Get Out","url":"http://seatgeek.com/all-get-out-tickets","type":"band","image":null,"slug":"all-get-out","score":0.45788,"images":{},"id":22319},{"name":"Harrison Hudson","short_name":"Harrison Hudson","url":"http://seatgeek.com/harrison-hudson-tickets","type":"band","image":null,"slug":"harrison-hudson","score":0.1917,"images":{},"id":24496},{"name":"Roadkill Ghost Choir","short_name":"Roadkill Ghost Choir","url":"http://seatgeek.com/roadkill-ghost-choir-tickets","type":"band","image":null,"slug":"roadkill-ghost-choir","score":0,"images":{},"id":61464},{"name":"The Wild","short_name":"The Wild","url":"http://seatgeek.com/the-wild-1-tickets","type":"band","image":null,"slug":"the-wild-1","score":0,"images":{},"id":163446}],"url":"http://seatgeek.com/manchester-orchestra-with-justin-townes-earle-and-harrison-hudson-and-the-stuffing-and-the-wild-tickets/atlanta-georgia-center-stage-theatre-2013-11-26-5-30-pm/concert/1792994/","venue":{"city":"Atlanta","name":"Center Stage Theatre","extended_address":"Atlanta, GA 30309","url":"http://seatgeek.com/venues/center-stage-theatre/tickets/","country":"US","display_location":"Atlanta, GA","links":[],"slug":"center-stage-theatre","state":"GA","score":0.52543,"postal_code":"30309","location":{"lat":33.7921,"lon":-84.3877},"address":"1374 W. Peachtree St. NW","id":829},"short_title":"Manchester Orchestra with Justin Townes Earle and Harrison Hudson and The Stuffing and The Wild","datetime_utc":"2013-11-26T22:30:00","general_admission":true,"datetime_tbd":false},{"links":[],"id":1763514,"stats":{"listing_count":105,"average_price":105.0,"lowest_price":75.0,"highest_price":1931.0},"title":"Not So Silent Night with Young The Giant, Grouplove, New Politics","score":0.62198,"date_tbd":false,"type":"music_festival","datetime_local":"2013-12-01T18:00:00","time_tbd":false,"taxonomies":[{"parent_id":null,"id":2000000,"name":"concert"},{"parent_id":2000000,"id":2010000,"name":"music_festival"}],"performers":[{"name":"Not So Silent Night","short_name":"Not So Silent Night","url":"http://seatgeek.com/not-so-silent-night-tickets","type":"music_festival","image":"http://cdn.chairnerd.com/images/performers-landscape/not-so-silent-night-663769/2538/huge.jpg","primary":true,"slug":"not-so-silent-night","score":0.64479,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/not-so-silent-night-663769/2538/huge.jpg","medium":"http://cdn.chairnerd.com/images/performers/2538/not-so-silent-night-9342ab/medium.jpg","large":"http://cdn.chairnerd.com/images/performers/2538/not-so-silent-night-fe10b8/large.jpg","small":"http://cdn.chairnerd.com/images/performers/2538/not-so-silent-night-4a9d11/small.jpg"},"id":2538},{"name":"New Politics","short_name":"New Politics","url":"http://seatgeek.com/new-politics-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers/6092/new-politics-8e13d0/huge.jpg","slug":"new-politics","score":0.60703,"images":{"large":"http://cdn.chairnerd.com/images/performers/6092/new-politics-054cf9/large.jpg","huge":"http://cdn.chairnerd.com/images/performers/6092/new-politics-8e13d0/huge.jpg","small":"http://cdn.chairnerd.com/images/performers/6092/new-politics-20d2b2/small.jpg","medium":"http://cdn.chairnerd.com/images/performers/6092/new-politics-3554b9/medium.jpg"},"id":6092},{"name":"Young The Giant","short_name":"Young The Giant","url":"http://seatgeek.com/young-the-giant-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/young-the-giant-f44406/8741/huge.jpg","slug":"young-the-giant","score":0.53792,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/young-the-giant-f44406/8741/huge.jpg","medium":"http://cdn.chairnerd.com/images/performers/8741/young-the-giant-686f92/medium.jpg","large":"http://cdn.chairnerd.com/images/performers/8741/young-the-giant-eec61c/large.jpg","small":"http://cdn.chairnerd.com/images/performers/8741/young-the-giant-af7a89/small.jpg"},"id":8741},{"name":"Grouplove","short_name":"Grouplove","url":"http://seatgeek.com/grouplove-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg","slug":"grouplove","score":0.51656,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/grouplove-48fdd4/8987/huge.jpg"},"id":8987},{"name":"Bastille","short_name":"Bastille","url":"http://seatgeek.com/bastille-tickets","type":"band","image":"http://cdn.chairnerd.com/images/performers-landscape/bastille-c956d6/29495/huge.jpg","slug":"bastille","score":0.50499,"images":{"huge":"http://cdn.chairnerd.com/images/performers-landscape/bastille-c956d6/29495/huge.jpg"},"id":29495}],"url":"http://seatgeek.com/not-so-silent-night-with-young-the-giant-grouplove-new-politics-tickets/broomfield-colorado-1stbank-center-2013-12-01-6-pm/music-festival/1763514/","venue":{"city":"Broomfield","name":"1stBank Center","extended_address":"Broomfield, CO 80021","url":"http://seatgeek.com/venues/1stbank-center/tickets/","country":"US","display_location":"Broomfield, CO","links":[],"slug":"1stbank-center","state":"CO","score":0.66001,"postal_code":"80021","location":{"lat":39.9046,"lon":-105.087},"address":"11450 Broomfield Lane","id":2280},"short_title":"Not So Silent Night with Young The Giant, Grouplove, New Politics","datetime_utc":"2013-12-02T01:00:00","datetime_tbd":false}]}

function findSeatGeekEventsNearIp(callback, error, ip) {	
	var searchUrl = "http://api.seatgeek.com/2/events?taxonomies.name=concert&per_page=1000&range=30mi&geoip=" + ip;	

	console.log(searchUrl);

	request(searchUrl, function(err, response, body) {
		if (err) { error(err); return; }
		data = JSON.parse(body);
		if (data["events"].length == 0 ) {
			console.log("Failed with 0 results: " + artistName + " , " + artistTerm);
			callback([]);
		} else {
			var events = data.events;
			console.log("Pre-filtering events: " + events.length);
			callback(events);
		}
	});
}
exports.findSeatGeekEventsNearIp = findSeatGeekEventsNearIp;

function test(){
	findSeatGeekEventsForArtist(
		function(events) {
			//console.log(events);			
		},
		function(e) {
			console.log("ERrror");
			console.log(e);
		},
		"Crocodiles"
	);
}
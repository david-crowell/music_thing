var request = require("request");

function searchForTrack(query, callback, error) {
	if (query.charAt(0) != '"') {
		query = '"' + query + '"';
	}
	var uri = "http://ws.spotify.com/search/1/track.json?q=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			var body = JSON.parse(rawBody);
			callback(body.tracks);
		}
	);
}
exports.searchForTrack = searchForTrack;

function searchForArtist(query, callback, error) {
	if (query.charAt(0) != '"') {
		query = '"' + query + '"';
	}
	var uri = "http://ws.spotify.com/search/1/artist.json?q=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			var body = JSON.parse(rawBody);
			callback(body.artists);
		}
	);
}
exports.searchForArtist = searchForArtist;

function test() {
	searchForArtist("foo fighters",
		function(tracks) {		
			console.log(tracks);
			console.log(tracks.length + " results!");
		},
		function(e) {
			console.log("Error! " + e.toString());
		}
	);
}
//test();

//// TRACK search
// {
//     "info": {
//         "num_results": 425,
//         "limit": 100,
//         "offset": 0,
//         "query": "kaizers orchestra",
//         "type": "track",
//         "page": 1
//     },
//     "tracks": [
//         {
//             "album": {
//                 "released": "2010",
//                 "href": "spotify:album:5AN6A9IR1g1xRgY0RoKOsT",
//                 "name": "Hjerteknuser",
//                 "availability": {
//                     "territories": "NO"
//                 }
//             },
//             "name": "Hjerteknuser",
//             "popularity": "0.63",
//             "external-ids": [
//                 {
//                     "type": "isrc",
//                     "id": "NOHDL1002070"
//                 }
//             ],
//             "length": 199.407,
//             "href": "spotify:track:6dKWi7apHjn2W7Ojncv4Wu",
//             "artists": [
//                 {
//                     "href": "spotify:artist:1s1DnVoBDfp3jxjjew8cBR",
//                     "name": "Kaizers Orchestra"
//                 }
//             ],
//             "track-number": "1"
//         }
//     ]
// }

//// ARTIST search
// {
//     "info": {
//         "num_results": 21,
//         "limit": 100,
//         "offset": 0,
//         "query": "nirvana",
//         "type": "artist",
//         "page": 1
//     },
//     "artists": [
//         {
//             "href": "spotify:artist:6olE6TJLqED3rqDCT0FyPh",
//             "name": "Nirvana",
//             "popularity": "0.66"
//         },
//         {
//             "href": "spotify:artist:3sS2Q1UZuUXL7TZSbQumDI",
//             "name": "Approaching Nirvana",
//             "popularity": "0.31"
//         }
//     ]
// }
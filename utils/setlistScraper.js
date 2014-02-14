var request = require("request");
var webUtils = require("./webUtils");

var rootUrl = "http://www.setlist.fm/";

// returns array of dictionaries with "name" and "link" keys
function searchForArtist(callback, error, url) {
	webUtils.fetchPageJqueryDom(
		function ($, window) {
			var artistNameSearchLinksList = [];
			$(".artistFacets").find('li').each(
				function(liIndex, item) {
					var a = $(item).find('a')[0];	
					var link = rootUrl + $(a).attr('href');
					var name = $(a).find('span')[0].innerHTML;
					artistNameSearchLinksList.push({'name':name, 'link':link});
				}
			);
			callback(artistNameSearchLinksList);
		},
		error,
		url
	);
}

function getArtistNameSearchLink(callback, error, artistName) {
	var url = "http://www.setlist.fm/search?query=" + artistName;
	searchForArtist(
		function (artistNameSearchLinksList) {
			callback( artistNameSearchLinksList[0] );
		}, 
		error,
		url
	);
}

function getSetlistsFromSearchLink(callback, error, artistSearchLink) {
	console.log(artistSearchLink);
	webUtils.fetchPageJqueryDom(
		function ($, window) {
			var setlists = [];
			$(".listSetlists").find(".setlistPreview").each(
				function(index, item) {
					var a = $($(item).find('h2')[0]).find('a')[0];
					var link = $(a).attr('href');
					var title = a.innerHTML
					setlists.push( {'title':title, 'link':link} );
				}
			);
			callback(setlists);
		},
		error,
		artistSearchLink.link
	);
}

/*
$('tr').each(function(trIndex, row) {
		var isRowBullshit = false;
		var date, artistName, time, venueName, venueAddress, venueCity, venueState, venuePostalCode, venueCountry, venueGeo, ticketUrl;
		$(row).find('td').each( function(index, td) {
			if ($(td).attr('class') == 'hd') {
				return true;
			} if ($(td).attr('class') == 'rShim') {
				isRowBullshit = true;
				return false;
			} if ($(td).attr('class') == 's1') {
				isRowBullshit = true;
				return false;
			}
			*/

function test() {
	getArtistNameSearchLink(
		function(artistNameSearchLink) {		
			getSetlistsFromSearchLink(
				function(setlists) {
					console.log(setlists);
				},
				function(e) {
					console.log("Fuck");
				},
				artistNameSearchLink
			);
		},
		function(e) {
			console.log("Error! " + e.toString());
		},
		"nirvana"
	);
}
test();

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
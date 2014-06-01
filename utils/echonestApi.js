var request = require('request');
var config = require('../config.js');
var parser = require('./textParser.js');
var webUtils = require('./webUtils.js');
var textParser = require('./textParser.js');
var languageUtils = require('./languageUtils');

var API_KEY = config.echonestApiKey;
//default key = "FILDTEOIK2HBORODV"

function similarArtists(callback, error, query, limit, start) {
	if (!limit) { limit = 30; }
	if (!start) { start = 0; }

	if (query.charAt(0) != '"') {
		query = '"' + query + '"';
	}

	var uri = "http://developer.echonest.com/api/v4/artist/similar?api_key=" + API_KEY + "&format=json&results=" + limit + "&start=" + start + "&name=" + query + "&bucket=id:spotify-WW";


	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}

			var body = JSON.parse(rawBody);
			if (body.response.status.code === 2) {
				error(body.response.status.message);
				return;
			}

			callback(body.response.artists);
		}
	);
}
exports.similarArtists = similarArtists;
//{"response": {"status": {"version": "4.2", "code": 0, "message": "Success"}, "artists": [{"id": "ARH1N081187B9AC562", "name": "Thom Yorke"}, {"id": "ARW64KS1187FB3C94D", "name": "Doves"}, {"id": "AR0L04E1187B9AE90C", "name": "The Verve"}, {"id": "ARTNON61187B98D6EE", "name": "Elbow"}, {"id": "ARZ0RS81187B98F252", "name": "Mercury Rev"}, {"id": "ARKVITV1187B9AE854", "name": "Blur"}, {"id": "ARZNOIY1187B989D9C", "name": "On a Friday"}, {"id": "ARR3ONV1187B9A2F59", "name": "Muse"}, {"id": "ARIIMPS1187FB4CD03", "name": "Richard Ashcroft"}, {"id": "ARGEJ8B1187B9AE2E7", "name": "Manic Street Preachers"}, {"id": "ARG7LMD1187FB4B064", "name": "Mansun"}, {"id": "ARJ7KF01187B98D717", "name": "Coldplay"}, {"id": "ARHRMYH1187B9A675B", "name": "Mew"}, {"id": "ARA1OFS1187B9AE656", "name": "British Sea Power"}, {"id": "ARC2XR11187FB5CC95", "name": "Beck"}, {"id": "ARHHUDL1187B997966", "name": "Keane"}, {"id": "ARCMOKD1187B9AEB21", "name": "Starsailor"}, {"id": "ARNVCB81187B9ACBDF", "name": "The Flaming Lips"}, {"id": "AR2A6UJ1187FB4BF5C", "name": "The Good, the Bad & the Queen"}, {"id": "ARDW3YJ1187FB4CCE5", "name": "Athlete"}]}}

function similarArtistNames(callback, error, query, limit, start) {
	similarArtists(
		function(artists) {
			var artistNames = [];

			for (var i = 0; i < artists.length; i++) {
				artistNames.push(artists[i].name);
			}

			callback(artistNames);	
		},
		error,
		query,
		limit,
		start
	);
}
exports.similarArtistNames = similarArtistNames;


function similarArtistsMultiple(callback, error, artists, limit, start) {
	if (!limit) { limit = 30; }
	if (!start) { start = 0; }

	var uri = "http://developer.echonest.com/api/v4/artist/similar?api_key=" + API_KEY + "&format=json&results=" + limit + "&start=" + start + "&bucket=id:spotify-WW";
	for (var i = 0; i < artists.length; i++) {
		var artist = artists[i];
		uri = uri + "&name=" + encodeURIComponent(artist);
	};
	console.log(uri);

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}

			var body = JSON.parse(rawBody);
			if (body.response.status.code === 2) {
				error(body.response.status.message);
				return;
			}

			var artists = body.response.artists;
			for (var i = 0; i < artists.length; i++) {
				if (artists[i].foreign_ids) {
					artists[i].spotify_id = artists[i].foreign_ids[0].foreign_id.replace('spotify-WW:','');
					artists[i].echonest_id = artists[i].id;
					delete artists[i].id;
					delete artists[i].foreign_ids;
				}
			};

			callback(artists);
		}
	);
}
exports.similarArtistsMultiple = similarArtistsMultiple;

function similarArtistNamesMultiple(callback, error, artists, limit, start) {
	similarArtistsMultiple(
		function(artists) {
			var artistNames = [];

			for (var i = 0; i < artists.length; i++) {
				artistNames.push(artists[i].name);
			}

			callback(artistNames);	
		},
		error,
		query,
		limit,
		start
	);
}
exports.similarArtistNamesMultiple = similarArtistNamesMultiple;


function artistProfile(callback, error, query) {
	var uri = "http://developer.echonest.com/api/v4/artist/profile?api_key=BOAYYST4VLXT0J6UC&format=json&bucket=id:spotify-WW&bucket=biographies&bucket=reviews&bucket=blogs&name=";
	uri = uri + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			
			var body = JSON.parse(rawBody);
			var artist = body.response.artist;
			var reviews = artist.reviews;

			console.log("############## Reviews: " + reviews.length);
			callback(body);
		}
	);
}
exports.artistProfile = artistProfile;

function artistLimitedProfile(callback, error, query) {
	var uri = "http://developer.echonest.com/api/v4/artist/profile?api_key=BOAYYST4VLXT0J6UC&format=json&bucket=id:spotify-WW&bucket=id:musicbrainz&name=";
	uri = uri + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			
			var body = JSON.parse(rawBody);
			var artist = body.response.artist;

			callback(artist);
		}
	);
}
exports.artistLimitedProfile = artistLimitedProfile;

function extractMusicbrainzId(artist) {
	if (artist == null || artist.foreign_ids == null) {
		return;
	}
	for (var i = 0; i < artist.foreign_ids.length; i++) {
		var foreign_id = artist.foreign_ids[i];
		if (foreign_id["catalog"] == "musicbrainz") {
			var id = foreign_id["foreign_id"];
			id = id.split(':')[2];
			return id;
		}
	};
}
exports.extractMusicbrainzId = extractMusicbrainzId;

function extractSpotifyId(artist) {
	if (artist == null || artist.foreign_ids == null) {
		return;
	}
	for (var i = 0; i < artist.foreign_ids.length; i++) {
		var foreign_id = artist.foreign_ids[i];
		if (foreign_id["catalog"] == "spotify-WW") {
			var id = foreign_id["foreign_id"];
			id = id.split(':')[2];
			return id;
		}
	};
}
exports.extractSpotifyId = extractSpotifyId;

function mostLikelyEchonestArtist(callback, error, artistName) {
	suggestEchonestArtists(
		function(artistGuesses) {
			console.log(artistGuesses);
			for (var i = 0; i < artistGuesses.length; i++) {
				var artist = artistGuesses[i];
				var name = artist.name;
				if (languageUtils.string.areNoisyEqual(name, artistName)) {
					console.log("Found a match from " + artistName + " to " + name);
					return artist;
				} else {
					console.log(" no match from " + artistName + " to " + name);
				}
			}
		},
		error,
		artistName
	);
}

function isShortenedText(text) {
	return text.endsWith("...");
}

function fetchFullArticle(callback, error, article) {
	webUtils.fetchPageJqueryDom(
		function($) {
			var text = textParser.extractSanitizedParagraphText($);			
			article.text = text;
			callback(article);
		}, 
		function(e) {
			console.log('Fetch Page error: ' + e.toString());
			error(e);
		},
		article.url
	);
}

function fetchFullArticles(callback, error, articles) {
	var toDo = articles.length;
	var did = 0;

	function done(article) {
		did ++;
		if (did >= toDo) {
			callback(articles);
		}
	}

	for (var i = 0; i < toDo; i++) {
		var article = articles[i];
		if (isShortenedText(article.text)) {
			fetchFullArticle(
				done,
				done,
				article
			);
		} else {
			done(article);
		}
	};
	if (toDo === 0) {
		callback(articles);
	}
}
exports.fetchFullArticles = fetchFullArticles;



function artistReviews(callback, error, query, start) {
	if (!start) { start = 0; }

	var uri = "http://developer.echonest.com/api/v4/artist/reviews?api_key=BOAYYST4VLXT0J6UC&format=json&results=100&name=";
	uri = uri + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			
			var body = JSON.parse(rawBody);
			var reviews = body.response.reviews;

			for (var i = 0; i < reviews.length; i++) {
				reviews[i].text = reviews[i].summary;
			};

			fetchFullArticles(
				function(reviews) {
					callback(reviews);
					//callback( parser.findKeyWordsForArrayOfObjectsWithWordCountsProperty( biographies ) );
				},
				error,
				reviews
			);
		}
	);
}

function artistBiographies(callback, error, query, start) {
	if (!start) { start = 0; }

	var uri = "http://developer.echonest.com/api/v4/artist/biographies?api_key=BOAYYST4VLXT0J6UC&format=json&results=100&name=";
	uri = uri + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			
			var body = JSON.parse(rawBody);
			var biographies = body.response.biographies;

			fetchFullArticles(
				function(biographies) {
					callback(biographies);
					//callback( parser.findKeyWordsForArrayOfObjectsWithWordCountsProperty( biographies ) );
				},
				error,
				biographies
			);
		}
	);
}

function artistArticles(callback, error, query) {
	var articles = []

	var methods = [artistBiographies, artistReviews];	
	var toDo = methods.length;
	var did = 0;

	function done() {
		did ++;
		if (did >= toDo) {
			//callback(articles);
			//var result = parser.findKeyWordsForArrayOfObjectsWithWordCountsProperty( articles );
			callback(articles);
		}
	}

	for (var i = 0; i < methods.length; i++) {
		var method = methods[i];
		method(
			function(subArticles) {
				console.log("Got a flavor of article: " + subArticles.length);
				articles = articles.concat(subArticles);
				done();
			},
			function(e) {
				console.log(e.toString());
				done();
			},
			query
		);
	};
}
exports.artistArticles = artistArticles;

function artistArticlesByType(callback, error, query) {
	var articlesByType = {};

	var resultLabels = ['biographies', 'reviews'];
	var methods = [artistBiographies, artistReviews];	
	var toDo = methods.length;
	var did = 0;

	function done() {
		did ++;
		if (did >= toDo) {
			//callback(articles);
			//var result = parser.findKeyWordsForArrayOfObjectsWithWordCountsProperty( articles );
			callback(articlesByType);
		}
	}
	function handleError(e) {
		console.log(e.toString());
		done();
	}

	artistBiographies(
		function(biographies) {
			console.log("Got biographies: " + biographies.length);
			articlesByType.biographies = biographies;
			done();
		},
		handleError,
		query
	);
	artistReviews(
		function(reviews) {
			console.log("Got reviews: " + reviews.length);
			articlesByType.reviews = reviews;
			done();
		},
		handleError,
		query
	);
}
exports.artistArticlesByType = artistArticlesByType;

function suggestArtists(callback, error, query, limit, start) {
	if (!limit) { limit = 30; }
	if (!start) { start = 0; }

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

function suggestEchonestArtists(callback, error, query, limit, start) {
	if (!limit) { limit = 30; }
	if (!start) { start = 0; }

	var uri = "http://developer.echonest.com/api/v4/artist/suggest?api_key=" + API_KEY + "&results=20&bucket=id:musicbrainz&name=" + query;

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}
			
			var body = JSON.parse(rawBody);
			var artists = [];

			console.log(body);
			for (var i = 0; i < body.response.artists.length; i++) {
				artists.push(body.response.artists[i]);
			}

			callback(artists);
		}
	);
}
exports.suggestEchonestArtists = suggestEchonestArtists;


function test() {
	/*
	artistArticles(
		function(articles) {		
			console.log(articles.length);
		},
		function(e) {
			console.log("Error! " + e.toString());
		},
		"Pearl Jam"
	);
	*/
	/*
	similarArtistsMultiple(
		function(artists) {
			console.log(artists);
		},
		function(e) {
			console.log("Error! " + e.toString());
		},
		["Nirvana", "Pearl Jam", "Bush"]
	);
	*/
	artistLimitedProfile(
		function(artist) {
			console.log(artist);
		},
		function(e) {
			console.log(e);
		},
		"deerhunter"
	);
}
//test();
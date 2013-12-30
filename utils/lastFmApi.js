var request = require('request');
var config = require('../config.js');
var parser = require('./textParser.js');
var API_KEY = config.lastFmApiKey;

function extractTagStrings(tagObjects) {
	var tags = [];
	var tagCounts = {};
	for (var i = 0; i < tagObjects.length; i++) {
		tags.push(tagObjects[i].name);
		tagCounts[tagObjects[i].name] = tagObjects[i].count;
	};
	return {'tagStrings':tags, 'tagCounts':tagCounts};
}

function getTags(callback, error, query) {
	/*
	if (query.charAt(0) != '"') {
		query = '"' + query + '"';
	}
	*/
	query = encodeURIComponent(query);

	var uri = "http://ws.audioscrobbler.com/2.0/?method=artist.getTopTags&api_key=" + API_KEY + "&format=json&autocorrect=1&artist=" + query;

	console.log(uri);

	request.get(
		uri,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}

			var body = JSON.parse(rawBody);
			var topTags = body.toptags.tag;
			var extractionResults = extractTagStrings(topTags);
			var tagStrings = extractionResults.tagStrings;
			var tagCounts = extractionResults.tagCounts;
			callback(tagStrings, tagCounts);
		}
	);
}
exports.getTags = getTags;

function getTagsForArtists(callback, error, artists) {
	var tagStringsArray = [];
	var tagCountsArray = [];

	var toDo = artists.length;
	var did = 0;

	function done() {
		did ++;
		if (did >= toDo) {
			//console.log(tagStringsArray);
			var results = parser.groupWordsInCommon(tagCountsArray);
			var mentions = results.numberOfArticlesMentioningWord;
			var scoreArrays = results.groupOfWordCounts;
			//var rankedByMentions = parser.findKeyWordsForNumberOfArticlesMentioningWord(mentions);
			var keywords = parser.findKeyWordsForWordToCountsArrayAndNumberOfArticlesMentioningWord(scoreArrays, mentions);
			//console.log(rankedByMentions);
			callback(keywords);
		}
	}

	for (var i = 0; i < artists.length; i++) {
		var artist = artists[i];
		getTags(
			function(tagStrings, tagCounts) {
				tagStringsArray.push(tagStrings);
				tagCountsArray.push(tagCounts);
				done();
			},
			function(e) {
				console.log(e.toString());
				done();
			},
			artist
		);
	};
	if (toDo === 0) {
		done();
	}
}
exports.getTagsForArtists = getTagsForArtists;

function test() {
	getTagsForArtists(
		function(keywords) {		
			console.log(keywords);
			//console.log(artists);
			//console.log(tracks.length + " results!");
		},
		function(e) {
			console.log("Error! " + e.toString());
		},
		["Nirvana", "Pearl Jam", "Temple of the Dog", "The Smashing Pumpkins", "Foo Fighters"]
	);
}
//test();
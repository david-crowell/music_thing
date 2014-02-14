var webUtils = require("./webUtils.js");
var textParser = require("./textParser.js");
var grammar = require("../grammar/grammar.js");
var echonestApi = require("./echonestApi.js");

function sortAsInt(array) {
	for (var i = 0; i < array.length; i++) {
		array[i] = parseInt(array[i]);
	};
	return array.sort(function (a, b) { return a-b; });
}

//callback
//	text : collected paragraph text, html removed
function fetchSanitizedText (callback, error, url) {
	webUtils.fetchPageJqueryDom(
		function($, window) {
			var text = textParser.extractSanitizedParagraphText($);
			callback(text);
		},
		error,
		url
	);
}

//callback
//	posTags : part of speech tags collected from paragraph text
function fetchPosTagsForUrl (callback, error, url) {
	fetchSanitizedText(
		function (text) {
			var posTags = grammar.getPosTagsFromText(text);
			callback(tags);
		},
		error,
		url
	);
}

function getPosTagsForArticle (article) {
	return grammar.getPosTagsFromText(article.text);
}

function filterForPosAndReturnDictionaryWordToCount(tags) {
	//var goodTags = { 'VB':1, 'VBD':1, 'VBG':1, 'VBN':1, 'VBP':1,'VBZ':1, 'RB':1, 'RBR':1, 'RBS':1, 'NN':1, 'NNP':1, 'NNS':1, 'NNPS':1, 'JJ':1, 'JJR':1, 'JJS':1 }
	var goodTags = ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'RB', 'RBR', 'RBS', 'NN', 'NNP', 'NNS', 'NNPS', 'JJ', 'JJR', 'JJS'];
	//var goodTags = ['RB', 'RBR', 'RBS', 'JJ', 'JJR', 'JJS'];
	//var goodTags = ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ'];

	return grammar.filterTagsForPosAndReturnDictionaryWordToCount(tags, goodTags);
}

function getTagInfoFromArticles (articles) {
	var wordToTotalWordCount = {};
	var wordToArticlesInWhichItsMentionedCount = {};

	var start = new Date().getTime();	
	for (var i = 0; i < articles.length; i++) {		
		var article = articles[i];
		var posTags = getPosTagsForArticle(article);
		var wordToCount = filterForPosAndReturnDictionaryWordToCount( posTags );	

		for (word in wordToCount) {
			grammar.safeAddValueToValueAtKeyInDictionary( wordToTotalWordCount, word, wordToCount[word] );
			grammar.safeAddValueToValueAtKeyInDictionary( wordToArticlesInWhichItsMentionedCount, word, 1);
		}
	};
	var end = new Date().getTime();		
	console.log("Start: " + start);
	console.log("End: " + end);
	console.log(end - start);

	return {'wordToTotalWordCount': wordToTotalWordCount, 'wordToArticlesInWhichItsMentionedCount':wordToArticlesInWhichItsMentionedCount};
}

function getTagsFromArticles (articles) {
	var results = getTagInfoFromArticles(articles);
	var wordToTotalWordCount = results.wordToTotalWordCount;
	var wordToArticlesInWhichItsMentionedCount = results.wordToArticlesInWhichItsMentionedCount;

	var articlesMentioningCountToWord = {};

	for (word in wordToArticlesInWhichItsMentionedCount) {
		var count = wordToArticlesInWhichItsMentionedCount[word];
		grammar.safePutValueInArrayAtKeyInDictionary( articlesMentioningCountToWord, count, word );
	}
	return articlesMentioningCountToWord;
}

function run (callback, error, artist) {
	console.log("Starting run");
	//echonestApi.artistArticlesByType(
	echonestApi.artistArticles(
		function(articles) {
			//var articles = articlesByType.reviews;
			console.log("Got artist articles" + articles.length);
			var tags = getTagsFromArticles(articles);

			var mentionCounts = Object.keys(tags)			
			for (var i = 0; i < mentionCounts.length; i++) {
				var mentions = mentionCounts[i];
				console.log(mentions + " : " + tags[mentions]);
			};

			callback(tags);
		},
		function(e) {
			console.log("Error! " + e.toString());
		},
		artist
	);
	/*
	fetchTagsForUrl(
		function (tags) {
			var wordToCount = filterForPosAndReturnDictionaryWordToCount(tags);
			callback(wordToCount);
		},
		error,
		url
	);
	*/
}

function test() {
	run(
		function (result) {
			console.log("done");
		},
		function (e) {
			console.log(e.toString());
		},
		"B.B. King"
	);
}
test();
var jsdom = require('jsdom');
var request = require('request');
var zlib = require('zlib');

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function groupWordsInCommon(arrayOfWordCounts) {
	var groupOfWordCounts = {};
	var numberOfArticlesMentioningWord = {};

	for (var i = 0; i < arrayOfWordCounts.length; i++) {
		articleWordCounts = arrayOfWordCounts[i];
		for (var word in articleWordCounts) {
			var wordCount = articleWordCounts[word];
			if (word in groupOfWordCounts) {
				groupOfWordCounts[word].push(wordCount);
			} else {
				groupOfWordCounts[word] = [wordCount];
			}
			if (word in numberOfArticlesMentioningWord) {
				numberOfArticlesMentioningWord[word] += 1;
			} else {
				numberOfArticlesMentioningWord[word] = 1;
			}
		};
	};

	return {"groupOfWordCounts": groupOfWordCounts, "numberOfArticlesMentioningWord": numberOfArticlesMentioningWord};
}
exports.groupWordsInCommon = groupWordsInCommon;

function groupByNumberOfArticlesAppearingIn(numberOfArticlesMentioningWord) {
	var articleMentionsToWordsArray = {};
	for (var word in numberOfArticlesMentioningWord) {
		var mentions = numberOfArticlesMentioningWord[word];
		if (mentions in articleMentionsToWordsArray) {
			articleMentionsToWordsArray[mentions].push(word);
		} else {
			articleMentionsToWordsArray[mentions] = [word];
		}
	}
	return articleMentionsToWordsArray;
}

function averageCounts(counts, numberToAverageOver) {
	var runningSum = 0;
	for (var i = 0; i < counts.length; i++) {
		var count = parseInt(counts[i]);
		runningSum += count;
	};
	return parseFloat(runningSum) / parseFloat(numberToAverageOver);
}

function computeAverageCounts(wordsToCountArray) {
	var numberToAverageOver = 1;
	for (var word in wordsToCountArray) {
		if (wordsToCountArray[word].length > numberToAverageOver) {
			numberToAverageOver = wordsToCountArray[word].length;
		}
	}
	var wordToAverageCount = {};
	for (var word in wordsToCountArray) {
		var counts = wordsToCountArray[word];
		var averageCount = averageCounts(counts, numberToAverageOver);

		wordToAverageCount[word] = averageCount;
	}
	return wordToAverageCount;
}

function groupByAverageCountAfterFilteringForWords(wordToAverageCount, onlyTheseWords) {
	var averageCountToWordArray = {};
	for (var word in wordToAverageCount) {
		if (onlyTheseWords.indexOf(word) != -1) {
			var averageCount = wordToAverageCount[word];
			if (averageCount in averageCountToWordArray) {
				averageCountToWordArray[averageCount].push(word);
			} else {
				averageCountToWordArray[averageCount] = [word];
			}
		}
	}
	return averageCountToWordArray;
}
exports.groupByAverageCountAfterFilteringForWords = groupByAverageCountAfterFilteringForWords;

function sortAsFloat(array) {
	for (var i = 0; i < array.length; i++) {
		array[i] = parseFloat(array[i]);
	};
	return array.sort(function (a, b) { return a-b; });
}

function findKeyWordsForWordToCountsArrayAndNumberOfArticlesMentioningWord(wordsToCountArray, numberOfArticlesMentioningWord) {
	var wordToAverageCount = computeAverageCounts(wordsToCountArray);
	var articleMentionsToWordsArray = groupByNumberOfArticlesAppearingIn(numberOfArticlesMentioningWord);

	var counts = Object.keys(articleMentionsToWordsArray);
	counts = counts.sort();

	var last;
	var penultimate;
	var antepenultimate;
	var wordsToInclude = [];
	if (counts.length >= 1) {
		last = counts[counts.length - 1];
		wordsToInclude = wordsToInclude.concat(articleMentionsToWordsArray[last]);
	} if (counts.length >= 3) {
		penultimate = counts[counts.length -2];
		wordsToInclude = wordsToInclude.concat(articleMentionsToWordsArray[penultimate]);
	} if (counts.length >= 5) {
		antepenultimate = counts[counts.length -3];
		wordsToInclude = wordsToInclude.concat(articleMentionsToWordsArray[antepenultimate]);
	} 
	// Only try words that are in the maximally-matched number of articles
	var averageCountToFilteredWordArray = groupByAverageCountAfterFilteringForWords( wordToAverageCount, wordsToInclude );
	var scores = Object.keys(averageCountToFilteredWordArray);
	scores = sortAsFloat(scores);

	var ranked = [];
	for (var i = scores.length - 1; i >= 0; i--) {
		var score = scores[i];
		if (score === 0) {
			continue;
		}
		var words = averageCountToFilteredWordArray[score];
		ranked = ranked.concat(words);
		console.log(score + " : " + words);
	};
	var topScore = scores[scores.length - 1];
	//console.log(ranked);
	return ranked;
}
exports.findKeyWordsForWordToCountsArrayAndNumberOfArticlesMentioningWord = findKeyWordsForWordToCountsArrayAndNumberOfArticlesMentioningWord;

function findKeyWordsForNumberOfArticlesMentioningWord(numberOfArticlesMentioningWord) {
	var articleMentionsToWordsArray = groupByNumberOfArticlesAppearingIn(numberOfArticlesMentioningWord);
	return articleMentionsToWordsArray;	
}
exports.findKeyWordsForNumberOfArticlesMentioningWord = findKeyWordsForNumberOfArticlesMentioningWord;

function findKeyWordsForArrayOfWordCounts(arrayOfWordCounts) {
	var response = groupWordsInCommon(arrayOfWordCounts);
	var groupOfWordCounts = response.groupOfWordCounts;
	var numberOfArticlesMentioningWord = response.numberOfArticlesMentioningWord;

	return findKeyWordsForNumberOfArticlesMentioningWord(numberOfArticlesMentioningWord);
}
exports.findKeyWordsForArrayOfWordCounts = findKeyWordsForArrayOfWordCounts;

function findKeyWordsForArrayOfObjectsWithWordCountsProperty(arrayOfArticles) {
	var arrayOfWordCounts = [];
	for (var i = 0; i < arrayOfArticles.length; i++) {
		arrayOfWordCounts.push(arrayOfArticles[i].wordCounts);
	};
	var articleMentionsToWordsArray = findKeyWordsForArrayOfWordCounts(arrayOfWordCounts);
	var counts = Object.keys(articleMentionsToWordsArray);
	counts = counts.sort();
	if (counts.length >= 2) {
		console.log("@@@@@@@@@");
		var last = counts[counts.length - 1];
		var penultimate = counts[counts.length - 2]
		console.log(penultimate);
		console.log(articleMentionsToWordsArray[penultimate]);
		console.log("%%%%");
		console.log(last);
		console.log(articleMentionsToWordsArray[last]);
	}
	//console.log(counts);
	//return articleMentionsToWordsArray;
}
exports.findKeyWordsForArrayOfObjectsWithWordCountsProperty = findKeyWordsForArrayOfObjectsWithWordCountsProperty;

function getWords(text) {
	words = text.split(/[\s(),.?!]+/);
	var filteredWords = [];
	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		if (!(word in ignorable)) {
			filteredWords.push(word)
		}
	};
	return filteredWords;
}
exports.getWords = getWords;

function groupWords(words) {
	wordCounts = {};
	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		if (word in wordCounts) {
			wordCounts[word] += 1;
		} else {
			wordCounts[word] = 1;
		}
	}
	return wordCounts;
}
exports.groupWords = groupWords;

function extractParagraphs($) {
	var text = "";
	$("p").each(
		function(index, paragraphEle) {					
			text += paragraphEle.innerHTML;
		}
	);
	return text;
}

function clearFormatting(text) {
	result = text.replace(/<.[^>]*>/,"");
	result = result.replace(/&nbsp;/," ");
	if (result === text) {
		return result
	} else {
		return clearFormatting(result)
	}
}

function fetchPage(callback, error, url) {
	request( 
		url,
		function (e, response, rawBody) {
			if (e) {
				error(e);
				return;
			}		

			jsdom.env(
				{
					html: rawBody,
					scripts: [
						'http://code.jquery.com/jquery-1.5.min.js'
						],
					done: function (err, window) {
						var $ = window.jQuery;
						callback($);
					}
				}
			);
		}
	);
}

function fetchAndParsePage(callback, error, url) {
	fetchPage(
		function($) {
			var text = extractParagraphs($);
			text = clearFormatting(text);
			text = text.toLowerCase();
			var words = getWords(text);
			var wordCounts = groupWords(words);
			callback(wordCounts);
		}, 
		function(e) {
			console.log(e.toString());
			error(e);
		},
		url
	);
}
exports.fetchAndParsePage = fetchAndParsePage;

function fetchGzipPage(callback, error, url) {	
	var unzipped = new SimpleStringStream();
	unzipped.on('end', function() {
		jsdom.env({
			html: unzipped.datums,
			scripts: [
				'http://code.jquery.com/jquery-1.5.min.js'
			]
		}, function (err, window) {
			var $ = window.jQuery;
		});
	});

	request( {
		    "uri": url,
		    headers: {
			    'Accept-Encoding': 'gzip'
  			}
  	}).pipe(zlib.createGunzip()).pipe(unzipped);	
}

function isShortenedText(text) {
	return text.endsWith("...");
}
exports.isShortenedText = isShortenedText;

function fetchFullArticle(callback, error, article) {
	fetchAndParsePage(
		function(wordCounts) {
			article.wordCounts = wordCounts;
			callback(article);
		},
		error,
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

var SimpleStringStream = function () {
	this.readable = true;
	this.writable = true;
	this.datums = '';
};
require("util").inherits(SimpleStringStream, require("stream"));

SimpleStringStream.prototype._transform = function (data) {
	data = data ? data.toString() : "";
	this.datums += data;
	this.emit("data", data);
};

SimpleStringStream.prototype.write = function () {
	this._transform.apply(this, arguments);
};

SimpleStringStream.prototype.end = function () {
	this._transform.apply(this, arguments);
	this.emit("end");
};

function test() {
	fetchAndParsePage(
		function(artists) {		
			//console.log(artists);
			//console.log(tracks.length + " results!");
		},
		function(e) {
			console.log("Error! " + e.toString());
		},
		"http://trouserpress.com/entry.php?a=radiohead"
	);
}
//test();

var ignorable = {'to':1, 'a':1, 'the':1, 'and':1, 'more':1, 'of':1, 'on':1, 'be':1, '':1, 'with':1, 'have':1, 'for':1, 'one':1, 'by':1, 'can':1, 'an':1, 'or':1, '&amp;':1, 'after':1, 'your':1, 'back':1, 'that':1, 'us':1, 'its':1, 'but':1, 'all':1, 'was':1, 'out':1, 'like':1, 'several':1, 'not':1, 'at':1, 'few':1, 'about':1, 'it':1, 'would':1, 'which':1, 'here':1, 'you':1, 'album':1, 'did':1, 'were':1, 'songs':1, 'right':1, 'albums':1, 'months':1, 'making':1, 'released':1, 'any':1, 'will':1, 'download':1, 'online':1, 'find':1, 'as':1, 'who':1, 'way':1, 'has':1, 'set':1, 'is':1, 'in':1, 'this':1, 'i':1, 'are':1, 'track':1, 'press':1, 'trademark':1, 'trademarks':1, '”':1, 'if':1, 'vol.':1, 'it’s':1, 'no':1, 'never':1, 'make':1, 'into':1, 'how':1, '|':1, 's':1, 'tracks':1, 'to':1, 'them':1, 'do':1, 'so':1, 'above':1, 'again':1, 'am':1, "aren't":1, 'because':1, 'been':1, 'before':1, 'being':1, 'below':1, 'between':1, 'both':1, 'by':1, "can't":1, 'cannot':1, 'could':1, "couldn't":1, "didn't":1, 'does':1, "doesn't":1, 'doing':1, "don't":1, "down":1, "during":1, 'each':1, 'few':1, 'from':1, 'further':1, 'had':1, "hadn't":1, "hasn't":1, "haven't":1, 'having':1, 'he':1, "he'll":1, "he's":1, 'her':1, 'here':1, "here's":1, 'hers':1, 'himself':1, 'his':1, "how's":1, "i'd":1, "i'll":1, "i'm":1, "i've":1, "isn't":1, 'itself':1, "let's":1, 'me':1, 'more':1, 'most':1, "musn't":1, 'my':1, 'myself':1, 'nor':1, 'off':1, 'once':1, 'only':1, 'other':1, 'ought':1, 'our':1, 'ours':1, 'bands':1, 'too':1, 'something':1, 'those':1, 'thing':1, 'rather':1, 'bad':1, 'overall':1, 'along':1, 'since':1, 'second':1, 'first':1, 'going':1, 'different':1, 'probably':1, 'take':1, 'hear':1, "there's":1, '/':1, '//':1, "that's":1, '"':1, "band's":1, 'yet':1, 'year':1, 'let':1, 'quite':1 };

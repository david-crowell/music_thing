var jsposModule = require("./jspos/jspos.js");
var ignorable = require('../utils/ignorable.js').ignorable;
var textParser = require("../utils/textParser.js");

var lexer = new jsposModule.Lexer();
var tagger = new jsposModule.POSTagger();

function lex (text) {
	return lexer.lex(text);
}
exports.lex = lex;

function tag (words) {
	return tagger.tag(words);
}
exports.tag = tag;

function getPosTagsFromText(text) {
	return tag( lex( text ) );
}
exports.getPosTagsFromText = getPosTagsFromText;

function safePutValueInArrayAtKeyInDictionary(dictionary, key, value) {
	if (dictionary[key]) {
		dictionary[key].push(value);
	} else {
		dictionary[key] = [value];
	}
}
exports.safePutValueInArrayAtKeyInDictionary = safePutValueInArrayAtKeyInDictionary;

function safeSetValueAtSubKeyInDictionaryAtKeyInDictionary(dictionary, key, subkey, value) {
	if (!dictionary[key]) {
		dictionary[key] = {};
	} 
	dictionary[key][subkey] = value;
}
exports.safeSetValueAtSubKeyInDictionaryAtKeyInDictionary = safeSetValueAtSubKeyInDictionaryAtKeyInDictionary;

function safeAddValueToValueAtSubKeyInDictionaryAtKeyInDictionary(dictionary, key, subkey, value) {
	var savedValue = 0;
	if (dictionary[key] && dictionary[key][subkey]) {
		savedValue = dictionary[key][subkey];
	}
	value += savedValue;
	safeSetValueAtSubKeyInDictionaryAtKeyInDictionary(dictionary, key, subkey, value);
}
exports.safeAddValueToValueAtSubKeyInDictionaryAtKeyInDictionary = safeAddValueToValueAtSubKeyInDictionaryAtKeyInDictionary;

function safeAddValueToValueAtKeyInDictionary(dictionary, key, value) {
	var savedValue = 0;
	if (dictionary[key]) {
		savedValue = dictionary[key];
	}
	value += savedValue;
	dictionary[key] = value;
}
exports.safeAddValueToValueAtKeyInDictionary = safeAddValueToValueAtKeyInDictionary;

function formatAsPosTagToWordToCount(tags) {
	var posTagToWordToCount = {};
	for (var i = 0; i < tags.length; i++) {
		var word = tags[i][0];
		var posTag = tags[i][1];

		safeAddValueToValueAtSubKeyInDictionaryAtKeyInDictionary( posTagToWordToCount, posTag, word, 1);
	};
	return posTagToWordToCount;
}
exports.formatAsPosTagToWordToCount = formatAsPosTagToWordToCount;

function wordIsGarbage(word) {
	if (word in ignorable) {
		return true;
	} else if (word.length < 3) {
		return true;
	} else if (word.match(textParser.garbageCharactersRegex) != null) {
		return true;
	}
	return false;
}

function filterTagsForPosAndReturnDictionaryWordToCount (tags, tagsToKeep) {
	var posTagToWordToCount = formatAsPosTagToWordToCount(tags);

	var approved = {};
	for (var i = 0; i < tagsToKeep.length; i++) {		
		var posTag = tagsToKeep[i];
		for (word in posTagToWordToCount[posTag]) {
			var count = posTagToWordToCount[posTag][word];
			safeAddValueToValueAtKeyInDictionary( approved, word.toLowerCase(), count );
		}
	}
	for (word in approved) {
		if (wordIsGarbage( word )) {
			delete approved[word];
		}
	}

	return approved;
}
exports.filterTagsForPosAndReturnDictionaryWordToCount = filterTagsForPosAndReturnDictionaryWordToCount;

//var tags = tagger.tag(words);

/*
for (i in tags) {
	var tag = tags[i];
	print(tag[0] + " /" + tag[1]);
}
*/
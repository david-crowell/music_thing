function dictionaryValues (dictionary) {
	return Object.keys(dictionary).map(function(key){
    	return dictionary[key];
	});
}
exports.dictionaryValues = dictionaryValues;

function meanOfPropertyOnObjects(property, objects) {
	var total = 0;
	for (var i = 0; i < objects.length; i++) {
		total += objects[i][property];
	};
	return total / objects.length;
}
exports.meanOfPropertyOnObjects = meanOfPropertyOnObjects;

function standadDeviationOfPropertyOnObjects(property, objects) {
	var squaredDifferences = 0;
	var mean = meanOfPropertyOnObjects(property, objects);
	for (var i = 0; i < objects.length; i++) {
		var value = objects[i][property];
		squaredDifferences += (mean - value) * (mean - value);
	};
	var variance = squaredDifferences / objects.length;
	var standardDeviation = Math.sqrt(variance);
	return standardDeviation;
}
exports.standadDeviationOfPropertyOnObjects = standadDeviationOfPropertyOnObjects;

function meanLengthOfNonEmptyArrayAtKeyOnObjects(key, objects) {
	var sum = 0;
	var total = 0;
	for (var i = 0; i < objects.length; i++) {
		var thisLength = objects[i][key].length;
		if (thisLength > 0) {
			sum += thisLength;
			total += 1;
		}
	};
	return sum / total;
}
exports.meanLengthOfNonEmptyArrayAtKeyOnObjects = meanLengthOfNonEmptyArrayAtKeyOnObjects;

function standadDeviationOfLengthOfNonEmptyArrayAtKeyOnObjects(key, objects) {
	var squaredDifferences = 0;
	var total = 0;
	var mean = meanLengthOfNonEmptyArrayAtKeyOnObjects(key, objects);
	for (var i = 0; i < objects.length; i++) {
		var value = objects[i][key].length;
		if (value > 0) {
			squaredDifferences += (mean - value) * (mean - value);
			total += 1;
		}
	};
	var variance = squaredDifferences / total;
	var standardDeviation = Math.sqrt(variance);
	return standardDeviation;
}
exports.standadDeviationOfLengthOfNonEmptyArrayAtKeyOnObjects = standadDeviationOfLengthOfNonEmptyArrayAtKeyOnObjects;


//////////////////
// String methods
//////////////////
exports.string = {};

function fixSuffixedThe(term) {
	var suffix = ", the";
	if (term.indexOf(suffix, term.length - suffix.length) !== -1) {
		term = term.substring(0, term.indexOf(suffix));
		term = "the " + term;
	}
	return term;
}

function scoreQualityOfMatch(first, second) {
	a = first.toLowerCase();
	b = second.toLowerCase();	
	if (a === b) return 10;

	if (a.indexOf("&amp;") === -1) {
		a = a.replace(/&/g, "&amp;")		
	}
	if (b.indexOf("&amp;") === -1) {
		b = b.replace(/&/g, "&amp;")
	}
	if (a === b) return 10;

	a = a.replace(/’/g, "'");
	b = b.replace(/’/g, "'");	
	if (a === b) return 10;

	a = fixSuffixedThe(a);
	b = fixSuffixedThe(b);
	if (a === b) return 9;

	var c = "the " + a;
	var d = "the " + b;
	if (c === b) return 8;
	if (d === a) return 8;

	a = a.replace(/&amp;/g, "and");
	b = b.replace(/&amp;/g, "and");
	if (a === b) return 7;

	a = a.replace(/vs\./g, "vs");
	b = b.replace(/vs\./g, "vs");
	if (a === b) return 7;

	return 0;
}
exports.string.scoreQualityOfMatch = scoreQualityOfMatch;

function stringsAreNoisyEqual(first, second) {
	a = first.toLowerCase();
	b = second.toLowerCase();	
	if (a === b) return true;

	if (a.indexOf("&amp;") === -1) {
		a = a.replace(/&/g, "&amp;")		
	}
	if (b.indexOf("&amp;") === -1) {
		b = b.replace(/&/g, "&amp;")
	}
	if (a === b) return true;

	a = a.replace(/’/g, "'");
	b = b.replace(/’/g, "'");	
	if (a === b) return true;

	a = fixSuffixedThe(a);
	b = fixSuffixedThe(b);
	if (a === b) return true;

	var c = "the " + a;
	var d = "the " + b;
	if (c === b) return true;
	if (d === a) return true;

	a = a.replace(/&amp;/g, "and");
	b = b.replace(/&amp;/g, "and");
	if (a === b) return true;

	a = a.replace(/vs\./g, "vs");
	b = b.replace(/vs\./g, "vs");
	if (a === b) return true;

	return (a === b);
}
exports.string.areNoisyEqual = stringsAreNoisyEqual;

function fixEncodingErrors(string) {
	return string.replace(/&amp;/g, "and");
}
exports.string.fixEncodingErrors = fixEncodingErrors;
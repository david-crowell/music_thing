if (!exports) { var exports = {};}

function fixSuffixedThe(term) {
	var suffix = ", the";
	if (term.indexOf(suffix, term.length - suffix.length) !== -1) {
		term = term.substring(0, term.indexOf(suffix));
		term = "the " + term;
	}
	return term;
}
exports.fixSuffixedThe = fixSuffixedThe;

function bandNamesAreEqual(first, second) {
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
exports.bandNamesAreEqual = bandNamesAreEqual;
var fs = require('fs');
var vm = require('vm');
var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);
includeInThisContext(__dirname+"/lexer.js");
includeInThisContext(__dirname+"/POSTagger.js");
includeInThisContext(__dirname+"/lexicon.js_");

exports.Lexer = Lexer;
exports.POSTagger = POSTagger;
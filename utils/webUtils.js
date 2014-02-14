var jsdom = require('jsdom');
var request = require('request');
var zlib = require('zlib');

//callback arguments:
//	rawHtml : string containing page html
function fetchPageHtml(callback, error, url) {
	request( 
		url,
		function (e, response, rawHtml) {
			if (e) {
				error(e);
				return;
			}		
			callback(rawHtml);
		}
	);
}
exports.fetchPageHtml = fetchPageHtml;

//callback
//  $ : window.jQuery
//  window : DOM window object
function getJqueryDomFromHtml(callback, error, rawHtml) {
	jsdom.env(
		{
			html: rawHtml,
			scripts: [
				'http://code.jquery.com/jquery-1.5.min.js'
				],
			done: function (err, window) {
				if (err) {
					error(err);
					return;
				}
				var $ = window.jQuery;
				callback($, window);
			}
		}
	);
}
exports.getJqueryDomFromHtml = getJqueryDomFromHtml;

//callback
//  $ : window.jQuery
//  window : DOM window object
function fetchPageJqueryDom(callback, error, url) {
	fetchPageHtml(
		function (rawHtml) {
			getJqueryDomFromHtml(
				callback,
				error,
				rawHtml			
			);
		},
		error,
		url
	);
} 
exports.fetchPageJqueryDom = fetchPageJqueryDom;

//callback
//  rawHtml : string containing page html
function fetchGzipPage(callback, error, url) {	
	var unzipped = new SimpleStringStream();
	unzipped.on('end', function() {
		callback(unzipped.datums);
	});

	request( {
		    "uri": url,
		    headers: {
			    'Accept-Encoding': 'gzip'
  			}
  	}).pipe(zlib.createGunzip()).pipe(unzipped);	
}

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
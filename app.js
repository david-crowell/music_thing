process.env.PWD = process.cwd()

/**
 * Module dependencies.
 */

require('v8-profiler');

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , echonest = require('./routes/echonest')
  , spotify = require('./routes/spotify')
  , seatgeek = require('./routes/seatgeek')
  , local = require('./routes/local')
  , discover = require('./routes/discover')
  , lastfm = require('./routes/lastfm')
  , setlist = require('./routes/setlist')


var app = express();
exports.app = app;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(process.env.PWD + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/suggest', echonest.suggest);
app.get('/similar', echonest.similar);
app.get('/artist', spotify.artist);
app.get('/users', user.list);
app.get('/local', local.index);
app.get('/foo', user.list);
app.get('/events', seatgeek.getArtistEvents);
app.get('/events/local', seatgeek.getLocalEvents);
app.get('/', discover.index);
app.post('/tags', lastfm.tags);
app.post('/similar', echonest.similarPost);
app.get('/setlist', setlist.createSetlist);
app.get('/setlist/embed', setlist.getEmbedCodeForSetlist);

var server;
function startServer(){
  server = http.createServer(app);
  server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
  exports.server = server;
}
exports.startServer = startServer;
startServer();
exports.server = server;

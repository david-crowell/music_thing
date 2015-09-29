process.env.PWD = process.cwd()

/**
 * Module dependencies.
 */
 
var express = require('express')
  , favicon = require('serve-favicon')
  , logger = require('logger')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , errorHandler = require('error-handler')
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

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(process.env.PWD + '/public/img/favicon.png'));
//app.use(logger());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(process.env.PWD + '/public'));

if ('development' == app.get('env')) {
  //app.use(errorHandler());
}

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

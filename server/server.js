// Set up common namespace for the application
// As this is the global namespace, it will be available across all modules
if(!global['App']){
	global.App = {};
}


var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var methodOverride = require('method-override');
var	nconf = require('nconf');
var	http = require('http');
var	path = require('path');
var morgan = require('morgan');


var routes = require('./api/routes/router');

nconf.argv()
  .env()
  .file({ file: 'server-config.json'});

var ServerConfig = nconf.get("ServerConfig");

var app = express();

app.set('port', process.env.PORT || ServerConfig.port);

// Logging
var logger = morgan('combined');
app.use(morgan('combined'));

if(ServerConfig.enableUpload){
  // bodyParser middleware processing ...
}

if(ServerConfig.enableCompression){
  app.use(compression());
}
if(ServerConfig.enableSessions){
//  app.use(express.cookieParser());
//  app.use(express.session({ secret: ServerConfig.sessionSecret, store: store, cookie: { secure: false, maxAge:86400000 } }));
}
//app.use(methodOverride());


//CORS Supports
/*if(ServerConfig.enableCORS){
	app.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', ServerConfig.AccessControlAllowOrigin); // allowed hosts
		res.header('Access-Control-Allow-Methods', ServerConfig.AccessControlAllowMethods); // what methods should be allowed
		res.header('Access-Control-Allow-Headers', ServerConfig.AccessControlAllowHeaders); //specify headers
		res.header('Access-Control-Allow-Credentials', ServerConfig.AccessControlAllowCredentials); //include cookies as part of the request if set to true
		res.header('Access-Control-Max-Age', ServerConfig.AccessControlMaxAge); //prevents from requesting OPTIONS with every server-side call (value in seconds)

		if (req.method === 'OPTIONS') {
			res.send(204);
		}
		else {
			next();
		}
	});
}*/


// SERVE STATIC CONTENT -------------------------------
var staticOptions = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}

app.use(express.static(path.join(__dirname, ServerConfig.webRoot), staticOptions));

// REGISTER ROUTES ------------------------------------
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/api', routes(router)); // all of our routes will be prefixed with /api


// ERROR HANDLING -------------------------------------
app.use((req, res) => {
  res.status(404).send({url: req.originalUrl + ' not found.'})
});

// Let's start the server
app.listen(app.get('port'), () => {
  console.log("Welcome. Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

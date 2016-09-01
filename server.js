
/*
Express is a library that we installed by running
npm install express --save
in the terminal. It is located in the node_modules folder.
Express makes our job of writing a node server much easier by
providing shortcuts for many of the tasks that would otherwise
take a lot of code to complete.

typeof(express) == "function"
*/
var express = require("express");

/*
We call the express function to create a new "Express App"
This "app" will handle every request that comes in to our server
We're going to configure this app to handle the requests the
way that we want.
*/
var app = express();

/*
	process.env.PORT is an environment (system) variable
	which allows an external application like Heroku to
	set the port for our server. Or, we use the default
	port of 8000. Remember! Ports below 1024 are reserved
	for administrator use only.
*/
var PORT = process.env.PORT || 8000;

/*
	Require (but don't yet use) the body-parser middleware
	(installed using "npm install --save body-parser")
	This will take any POST request body, parse it, and
	give it to us as an object called req.body, after the
	request has passed through that middleware
*/
var bodyParser = require('body-parser');

/*
	This does the same thing as above except that it
	handles our session data - it adds an object
	called req.session, which is unique to each user
	and persists for that user across requests
*/
var session = require('express-session');

/*
Application-lifetime variable to hold all of the sightings
*/
var sightings = [];

/*
	"Transparent" middleware which logs the current requested URL
*/
app.use(function(req, res, next) {
	console.log(req.url);
	next();
});

/*
 bodyParser.urlencoded() returns a function(req, res, next) which is used
 as this layer of middleware. We pass an options object in as the first
 parameter to configure the way that the bodyparser middleware function works.
 This handles form submit data.
*/
app.use(bodyParser.urlencoded({ extended: false }));
// same, parse application/json (json AJAX requests)
app.use(bodyParser.json());


/*
	Add the .session property to the req object as it passes through
	this layer of middleware. The session object is per-user.
	By default, for a new user, the session object is empty
*/
app.use(session({
	secret: "lol pokemon", // this should not go on github (after you graduate)
	resave: false,
	saveUninitialized: false
}));

/*
	Load custom routes middleware (pages). This require function
	returns a function which we call, passing in app.
*/

var addRoutes = require("./routes_pages.js");
addRoutes(app);

/*
	Load API routes middleware (api)
*/

var addAPIRoutes = require('./routes_api.js');
addAPIRoutes(app, sightings);

/*
	Serve all files and folders in "public" as-is.
*/
app.use(express.static("public"));


setInterval(function(){
	time = Date.now();
	for(var i = 0; i < sightings.length; i++){
		if(sightings[i].timestamp <= time - 300000){
			sightings.splice(i,1)
		}
	}
300000});
/*
	If no other route matches, send a 404 error (file not found)
*/
app.use(function(req, res, next) {
	res.status(404);
	res.send("It's not very effective");
});

/*
	Start the server!
*/
app.listen(PORT, function() {
	console.log("Gotta catch 'em all on port " + PORT);
});

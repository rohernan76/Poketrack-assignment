
/*
	The following are the actual "business logic" middleware, which handle
	GET and POST requests to specific routes on the server. These routes
	all return either JSON data or plaintext error/success messages.

	Since many of them rely on the global variable "sightings", we have
	to pass a reference to that as well into our function so that
	they can refer to that array when they need to.
*/

/*
	Functions for dealing with users
*/
var UserFtns = require("./UserFtns.js");

/*
	If we use a local file (like "./whatever.js") that means
	that we're going to load the file from the current folder.
	So, we have written a file called Sightings.js in the current folder
	which exports some data on "module.exports". In this case, it is our
	constructor function for a sighting data point.
*/
var Sighting = require("./Sighting.js");

module.exports = function(app, sightings) {

	/*
		This is a route, that handles a GET request to localhost:8000/sighting
	*/
	app.get("/api/sighting", function(req, res) {
		//check if user is logged in
		if (!req.session.user) {
			res.send("error");
			return;
		}
		// send the entire sightings list, as a string
		res.send(JSON.stringify(sightings));
	});

	/*
		Handles a GET request to localhost:8000/sighting/4 (charmander!)
		The pokemonId variable (recognizable because it has a ":" in front of it)
		will end up in req.params.pokemonId

		If I have the ROUTE /sighting/:pokemonId/:city
		and I visit the URL /sighting/4/boulder
		then I will have
			req.params.pokemonId == 4
			req.params.city == "boulder"
	*/
	app.get("/api/sighting/id/:pokemonId", function(req, res) {
		//check if user is logged in
		if (!req.session.user) {
			res.send("error");
			return;
		}
		// send any sightings that match the pokemon id
		res.send( //send to the user
			JSON.stringify( // a string representing
				sightings //all of the sightings
				.filter( //which match the following
					function(loc) { //that
						return loc.pokemonId == req.params.pokemonId; //the ids match
					}
				)
			)
		);
	});


	/*
		Same as above, but with a filter on city name (loc string)
	*/
	app.get("/api/sighting/city/:cityName", function(req, res) {
		//check if user is logged in
		if (!req.session.user) {
			res.send("error");
			return;
		}
		// send any sightings that match the pokemon id
		res.send(JSON.stringify(sightings.filter(function(loc) {
			return loc.locStr == req.params.cityName;
		})));
	});

	/*
		This handles a POST request to /sighting
		A post request usually has a post body, which is information from the user
		about what we want to change on the server
		With a POST request, our data will be in req.body, and matches the object
		that is sent to the backend in the jQuery POST request
	*/
	app.post("/api/sighting", function(req, res) {
		// Check if the user is logged in
		if (!req.session.user) {
			res.send("error");
			return;
		}
		// Create our new Sighting object using the Sighting constructor function
		// (now we have a new sighting object) and store it in our super fancy
		// database (the sightings array)
		var newLoc = new Sighting(
			req.body.locStr,
			req.body.pokemonId,
			Date.now(),
			req.session.user);
		sightings.push(newLoc);

		//Tell the frontend that the request was successful
		res.send("success");
	});

	/*
		Here is where we handle a login with a username
		and password. Note that this is using the POST
		method.
	*/
	app.post('/api/login', function(req, res){
		// TODO: Make this for more than one user
		if (UserFtns.checkLogin(req.body.username, req.body.password)) {
			// if the user logs in, we set the session
			// variable for future requests (now the user is
			// logged in)
			// and then we say that the request was a success
			req.session.user = req.body.username;
			res.send("success");
		} else {
			// If something went wrong, we just say "error"
			res.send("error");
		}
	});

	app.get('/logout', function(req,res){
		req.session.user ="";
		res.send("success");
	});

	app.post('/api/register', function(req, res){
		//shorthand variables to save us time
		var username = req.body.username;
		var password = req.body.password;
		if (UserFtns.userExists(username)) {
			// If the username already exists
			if (UserFtns.checkLogin(username, password)) {
				// ... and they have the right password
				// then log the user in
				req.session.user = username;
				// Send "success" so that the frontend knows
				// it is ok to redirect to /map
				res.send("success");
			} else {
				// Otherwise, they might be trying to
				// take a username that already exists - error!
				res.send("error");
			}
		} else {
			// Username is not taken, register a new user
			// and log them in - success!
			if(UserFtns.registerUser(username, password)) {
				req.session.user = username;
				// Send "success" so that the frontend knows
				// it is ok to redirect to /map
				res.send("success");
			} else {
				// there was a problem registering
				res.send("error");
			}
		}
	});
};

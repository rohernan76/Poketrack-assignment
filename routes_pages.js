/*
	We return a function here which we can pass the app
	through in order to attach these middleware to  the app.
	None of these require any other variables, or we'd have
	to pass those in as well.
*/
module.exports = function(app) {
	/*
		We can use a regular expression (regex) for our route
		so in this case it will match both "map" and "map.html".

		Since this comes *before* the public folder, this means
		that no user will be able to load map.html without
		being logged in.
	*/
	app.get('/map(.html)?', function(req,res) {
		//Check if the user is logged in
		if (!req.session.user) {
			res.redirect("/login");
			return;
		}
		//send forward map.html
		res.sendFile(__dirname + "/public/map.html");
	});

	/*
		This is just a way of sending login.html to the user
		when they visit localhost:8000/login
	*/
	app.get('/login', function(req, res){
		// sendFile requires an absolute path, so we
		// have to use the __dirname, which tells us
		// what directory we are running node in.
		res.sendFile(__dirname + "/public/login.html");
	});
};

const server = require("../Backend/app");
const port = 8000;
const localhost = "http://localhost:";

try {
	server.initialize((err, app) => {
		if (err) {
			console.log("Could not start server", err);
		}

		app.listen(port, (err) => {
			if (err) {
				console.log("Could not start server", err);
			}
			console.log(`Server running at port ${localhost}${port}/`);
		})
	})
} catch (err) {
	console.log(`Could not start server : `, err);
}
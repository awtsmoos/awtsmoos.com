//B"H
var fetch = require("./fetch.js");
module.exports = async function({
	config,
	request,
	filePath
}) {
	var firebaseKey = config?.logFile /*
		service JSON file key for 
		firebase project
	*/;
	if(!firebaseKey) {
		return;
	}
}
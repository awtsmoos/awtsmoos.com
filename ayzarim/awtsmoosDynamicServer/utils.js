/**
 * B"H
 */
var fs = require("fs").promises;

async function exists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

function errorMessage(context, custom) {
	var {
		response
	} = context.dependencies;
	try {
		try {
			response.setHeader("content-type", "application/json; charset=utf-8");
		} catch (e) {}
		try {
			response.end(JSON.stringify({
				BH: "B\"H",
				error: custom || "Not found"
			}));
		} catch (e) {}
	} catch (e) {
		console.log(e)
	}
	return true;
}

module.exports = {
	exists,
	errorMessage
};
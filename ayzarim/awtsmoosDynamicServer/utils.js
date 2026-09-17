//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DynamicServerUtilities
 * @description
 * The Awtsmoos lets Awtsmoos.com ask whether a filesystem vessel exists while
 * every public failure passes through one guarded response boundary. Callers
 * may retain rich private diagnostics, but this module never sends them raw.
 */
const fs = require("fs").promises;
const {
	writePublicErrorResponse
} = require("./response/publicErrorResponse.js");

/**
 * @param {string} filePath Filesystem path to inspect privately.
 * @returns {Promise<boolean>} Whether the path is accessible.
 */
async function exists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

/**
 * @param {object} context Dynamic-server context containing dependencies.response.
 * @param {*} custom Rich internal failure value supplied by an existing caller.
 * @returns {boolean} True after the safe public error boundary handles the response.
 */
function errorMessage(context, custom) {
	return writePublicErrorResponse(context, custom);
}

module.exports = {
	exists,
	errorMessage
};
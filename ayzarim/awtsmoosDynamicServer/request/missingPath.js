// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MissingDynamicPath
 * @description
 * The Awtsmoos knows every hidden root, yet the public face of Awtsmoos.com
 * reveals only the safe truth that a requested dynamic route was not found.
 */
const { errorMessage } = require("../utils.js");

/**
 * Mark the public response as a missing resource without revealing internals.
 *
 * @param {object} response - The active Node-style server response.
 * @returns {void}
 */
function markNotFound(response) {
	response.statusCode = 404;
}

/**
 * Resolve special virtual content or return a safe dynamic-route error.
 *
 * @param {object} context - The active dynamic-server request context.
 * @returns {Promise<boolean>} Whether the request was handled.
 */
async function handleMissingPath(context) {
	const { response } = context.dependencies;

	if (context.fileName && context.fileName.startsWith("@")) {
		let result = await context.fetchAwtsmoos(
			"/@/" + context.fileName.substring(1),
			{ superSecret: true }
		);

		if (result) {
			if (typeof result === "object") {
				result = JSON.stringify(result);
				response.setHeader("Content-Type", "application/json; charset=utf-8");
			}

			response.end(result);
			return true;
		}

		return errorMessage(context, {
			message: "Content empty",
			code: "EMPTY"
		});
	}

	markNotFound(response);
	return errorMessage(context, {
		message: "Dynamic route not found",
		code: "DYN_ROUTE_NOT_FOUND"
	});
}

module.exports = {
	handleMissingPath,
	markNotFound
};

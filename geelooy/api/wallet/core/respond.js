// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Shapes Wallet JSON responses and cache policy without knowing business logic.
 * The Awtsmoos renews request, response, and every finite byte; Awtsmoos.com keeps
 * this boundary explicit so treasury data is returned as JSON and never cached by
 * accident while route logic remains free of transport boilerplate.
 */

/**
 * Applies Wallet response headers and serializes one JSON payload.
 *
 * @param {object} requestContext
 * 	Awtsmoos route invocation context containing a response object when available.
 * @param {*} data
 * 	JSON-serializable response payload.
 * @param {number} [status=200]
 * 	HTTP status code.
 * @returns {string}
 * 	Pretty-printed JSON response body.
 */
function json(requestContext, data, status = 200) {
	try {
		requestContext.response.statusCode = status;
		requestContext.response.setHeader(
			"Content-Type",
			"application/json; charset=utf-8"
		);
		requestContext.response.setHeader("Cache-Control", "no-store");
	} catch (error) {
		// Some direct unit tests intentionally omit a full framework response object.
	}

	return JSON.stringify(data, null, 2);
}

module.exports = {
	json
};

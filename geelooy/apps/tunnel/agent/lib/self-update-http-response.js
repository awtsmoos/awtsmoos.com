// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./self-update-http-policy.js");

/**
 * @file Collects one bounded update response and rejects broken stream testimony.
 * @description
 * The Awtsmoos renews declared size, received size, and stream completion together.
 * Awtsmoos.com destroys oversized bodies before they can consume the living agent
 * and distinguishes server abort from a complete bounded response.
 */
function collect(response, options = {}) {
	const maximum = Policy.maxBytes(options);
	const declared = Policy.contentLength(response);
	if (declared > maximum) {
		response.destroy();
		return Promise.reject(Policy.codedError("self_update_response_too_large", {
			maximum,
			declared
		}));
	}
	return new Promise((resolve, reject) => {
		const chunks = [];
		let bytes = 0;
		let settled = false;

		function finish(error, value) {
			if (settled) return;
			settled = true;
			error ? reject(error) : resolve(value);
		}

		response.on("data", chunk => {
			bytes += chunk.length;
			if (bytes > maximum) {
				response.destroy(Policy.codedError("self_update_response_too_large", {
					maximum,
					bytes
				}));
				return;
			}
			chunks.push(chunk);
		});
		response.once("end", () => finish(null, Buffer.concat(chunks, bytes)));
		response.once("error", error => finish(error));
		response.once("aborted", () => finish(
			Policy.codedError("self_update_response_aborted")
		));
	});
}

function isRedirect(response = {}) {
	return response.statusCode >= 300 && response.statusCode < 400 &&
		Boolean(response.headers?.location);
}

module.exports = {
	collect,
	isRedirect
};

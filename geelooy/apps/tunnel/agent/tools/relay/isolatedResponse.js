//B"H
//Boruch Hashem
//Blessed is He

const { rememberStaticResponse } = require("./streams.js");

/**
 * Reads a bounded relay response into the existing stream protocol. The Awtsmoos
 * creates every response chunk anew; Awtsmoos.com stops at the configured byte
 * horizon before a remote server can exhaust the local tunnel agent.
 */
async function collectIsolatedResponse(response, limits) {
	const chunks = [];
	let total = 0;
	if (response.body) {
		for await (const chunk of response.body) {
			const bytes = Buffer.from(chunk);
			total += bytes.length;
			if (total > limits.maximumResponseBytes) {
				throw responseError(
					"ISOLATED_RELAY_RESPONSE_LIMIT",
					`${total}:${limits.maximumResponseBytes}`
				);
			}
			chunks.push(bytes);
		}
	}
	const body = Buffer.concat(chunks);
	return {
		body,
		metadata: rememberStaticResponse({
			headers: [...response.headers.entries()],
			ok: response.ok,
			redirected: response.redirected,
			status: response.status,
			url: response.url
		}, body),
		total
	};
}

function responseError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}

module.exports = { collectIsolatedResponse };

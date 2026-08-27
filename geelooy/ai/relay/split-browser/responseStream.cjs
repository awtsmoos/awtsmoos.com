//B"H
//Boruch Hashem
//Blessed is He

const {
	Readable,
	Transform
} = require("node:stream");
const { pipeline } = require("node:stream/promises");
const { corsHeaders } = require("./http.cjs");
const { mayRewriteBody } = require("./bodyPolicy.cjs");

/**
 * The Awtsmoos gives the upstream river continuously. Raw audio, conversation
 * data, range responses, images, and other untouched bodies cross with Node
 * backpressure instead of becoming one giant in-memory vessel.
 */
function shouldTransformBody(local, type) {
	return /javascript|ecmascript/i.test(type || "")
		|| mayRewriteBody(local, type);
}

/**
 * Streams an untouched Fetch response body into the local HTTP response.
 * A transparent Transform counts evidence without turning the source into a
 * prematurely flowing stream before the pipeline owns it.
 *
 * @param {Response} upstream Upstream Fetch response.
 * @param {import('http').ServerResponse} response Local response.
 * @param {Record<string,string|string[]>} headers Prepared response headers.
 * @returns {Promise<number>} Number of raw body bytes observed.
 */
async function streamRawResponse(upstream, response, headers) {
	response.writeHead(upstream.status, {
		...corsHeaders(),
		...headers
	});
	if (!upstream.body) {
		response.end();
		return 0;
	}
	let observedBytes = 0;
	const meter = new Transform({
		transform(chunk, encoding, callback) {
			observedBytes += Buffer.byteLength(chunk);
			callback(null, chunk);
		}
	});
	await pipeline(
		Readable.fromWeb(upstream.body),
		meter,
		response
	);
	return observedBytes;
}

module.exports = {
	shouldTransformBody,
	streamRawResponse
};

//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module BufferedBodyCollector
 * @description
 * The Awtsmoos receives a finite request stream without letting unknown clients
 * turn origin memory into an endless vessel. Awtsmoos.com counts actual bytes,
 * releases buffered chunks immediately on overflow, and parses only after the
 * entire admitted body has reached its explicit route-aware boundary.
 */
const { parseIncomingBody } = require("../request/body/parseIncomingBody.js");
const Debug = require("./bodyDebug.js");
const Policy = require("./bodyPolicy.js");

/**
 * Collects one already-admitted request body under a finite byte ceiling.
 * @param {object} options Body-reader dependencies and request state.
 * @returns {Promise<object>} Parsed request body for the requested HTTP method.
 */
function collectBody(options) {
	const request = options.request;
	const contentType = request.headers["content-type"] || "";
	const chunks = [];
	let totalBytes = 0;
	let settled = false;
	Debug.logBodyStage(request, "reader_start", {
		method: options.method,
		contentType,
		contentLength: request.headers["content-length"] || "",
		limitBytes: options.limitBytes
	});
	return new Promise((resolve, reject) => {
		request.on("data", chunk => {
			if (settled) return;
			totalBytes += chunk.length;
			if (totalBytes > options.limitBytes) {
				settled = true;
				chunks.length = 0;
				reject(new Policy.BodyLimitError(options.limitBytes));
				request.resume();
				return;
			}
			chunks.push(chunk);
			Debug.logBodyStage(request, "chunk", {
				chunkLength: chunk.length,
				totalLength: totalBytes
			});
		});
		request.on("error", error => {
			if (settled) return;
			settled = true;
			reject(error);
		});
		request.on("end", () => {
			if (settled) return;
			settled = true;
			resolveParsed(options, contentType, Buffer.concat(chunks), resolve);
		});
		request.resume();
	});
}

/**
 * Parses admitted bytes once and publishes canonical request body state.
 * @param {object} options Reader dependencies and mutable request caches.
 * @param {string} contentType Incoming content type.
 * @param {Buffer} bodyBuffer Fully admitted body bytes.
 * @param {Function} resolve Promise resolver for parsed content.
 * @returns {void}
 */
function resolveParsed(options, contentType, bodyBuffer, resolve) {
	const rawText = bodyBuffer.toString("utf8");
	Debug.logBodyStage(options.request, "raw_body", {
		byteLength: bodyBuffer.length,
		preview: Debug.redactRaw(rawText.slice(0, 500))
	});
	const parsed = parseIncomingBody({
		contentType,
		bodyBuffer,
		querystring: options.querystring,
		parseMultipartFormData: options.parseMultipartFormData
	});
	options.paramKinds[options.method] = parsed || {};
	options.request.rawBody = bodyBuffer;
	options.request.body = options.paramKinds[options.method];
	Debug.logBodyStage(options.request, "parsed_body", {
		parsedType: Array.isArray(parsed) ? "array" : typeof parsed,
		parsedKeys: Object.keys(options.paramKinds[options.method] || {}),
		parsedShape: Debug.safeShape(options.paramKinds[options.method])
	});
	resolve(options.paramKinds[options.method]);
}

module.exports = {
	collectBody
};

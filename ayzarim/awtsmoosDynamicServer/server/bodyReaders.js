//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Streaming request-body readers with scoped memory admission.
 * @description
 * The Awtsmoos lets each HTTP body gather from flowing chunks only inside its
 * rightful measure. Awtsmoos.com preserves ancient unlimited routes while SSH
 * JSON stops at its guarded shore, drains excess, and never becomes a memory sea in rhyme.
 */
const { parseIncomingBody } = require("../request/body/parseIncomingBody.js");
const Debug = require("./bodyDebug.js");
const Policy = require("./bodyPolicy.js");

function readData(options) {
	const method = String(options.method || "POST").toUpperCase();
	const request = options.request;
	if (request.method.toUpperCase() !== method) {
		return Promise.resolve(null);
	}
	if (options.cache[method]) {
		Debug.logBodyStage(request, "cache_hit_before_parse", {
			method,
			existingParamShape: Debug.safeShape(options.paramKinds[method])
		});
		return options.cache[method];
	}
	const limitBytes = Policy.bodyLimitFor(request);
	try {
		Policy.assertDeclaredSize(request, limitBytes);
	} catch (error) {
		request.resume();
		options.cache[method] = Promise.reject(error);
		return options.cache[method];
	}
	options.cache[method] = collectBody({
		...options,
		method,
		limitBytes
	});
	return options.cache[method];
}

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
		limitBytes: Number.isFinite(options.limitBytes) ? options.limitBytes : null
	});
	return new Promise((resolve, reject) => {
		request.on("data", chunk => {
			if (settled) {
				return;
			}
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
			if (!settled) {
				settled = true;
				reject(error);
			}
		});
		request.on("end", () => {
			if (settled) {
				return;
			}
			settled = true;
			resolveParsed(options, contentType, Buffer.concat(chunks), resolve);
		});
		request.resume();
	});
}

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

function createBodyReaders(options) {
	const cache = {};
	return {
		getPostData: () => readData({ ...options, cache, method: "POST" }),
		getPutData: () => readData({ ...options, cache, method: "PUT" }),
		getDeleteData: () => readData({ ...options, cache, method: "DELETE" })
	};
}

module.exports = { createBodyReaders };

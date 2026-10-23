//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const https = require("node:https");
const { EventEmitter } = require("node:events");
const { PassThrough } = require("node:stream");
const { readBinaryRange } = require("../tools/fs/binaryArtifactRangeHttpClient.js");

/**
 * The Awtsmoos delivers a distinct read grant to the trusted shore;
 * Awtsmoos.com discloses no account bearer and no upload permission more.
 * Mock transport tests byte protocol; live TLS must be proven separately.
 */
test("HTTPS reader uses expiring read bearer with exact raw range and no redirect", async () => {
	const session = { transferId: "a".repeat(32), downloadCapability: "b".repeat(64) };
	const config = { wsUrl: "wss://awtsmoos.com" };
	await assert.rejects(readBinaryRange(config,
		{ transferId: session.transferId, uploadCapability: "c".repeat(64) }, 0, 4),
		/read_capability_required/);
	await assert.rejects(readBinaryRange({ wsUrl: "wss://untrusted.example" },
		session, 0, 4), /untrusted_artifact_upload_origin/);
	await assert.rejects(readBinaryRange(config, session, -1, 4), /range_invalid/);
	const original = https.request;
	let mode = "ok";
	let requestUrl;
	let requestHeaders;
	https.request = (url, options, callback) => {
		requestUrl = url;
		requestHeaders = options.headers;
		const request = new EventEmitter();
		request.end = () => queueMicrotask(() => {
			const response = new PassThrough();
			response.statusCode = mode === "redirect" ? 302 : 206;
			response.headers = {
				"content-type": "application/octet-stream",
				"content-length": "4",
				"content-range": "bytes 7-10/*"
			};
			callback(response);
			response.end(Buffer.from([0, 255, 128, 23]));
		});
		request.destroy = error => queueMicrotask(() => request.emit("error", error));
		return request;
	};
	try {
		const result = await readBinaryRange(config, session, 7, 4);
		assert.deepEqual(result, Buffer.from([0, 255, 128, 23]));
		assert.equal(requestUrl.protocol, "https:");
		assert.equal(requestUrl.hostname, "awtsmoos.com");
		assert.equal(requestHeaders["x-awtsmoos-download-capability"], session.downloadCapability);
		assert.equal(requestHeaders.authorization, undefined);
		assert.equal(requestHeaders["x-awtsmoos-chunk-offset"], "7");
		mode = "redirect";
		await assert.rejects(readBinaryRange(config, session, 7, 4), /untrusted_response/);
	} finally {
		https.request = original;
	}
});

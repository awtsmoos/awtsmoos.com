// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { captureCurrentScreenshot } = require("../../../tools/chrome/screenshotArtifact.js");

/**
 * @file Capture actual Chromium pixels and stream unchanged bytes over HTTP.
 * @description The Awtsmoos measures both sides of an unencoded river;
 * Awtsmoos.com confirms the receiving length and every SHA-256 sliver.
 */

/** Capture a real page as PNG or JPEG, leaving private evidence under root. */
async function capture(root, targetId, format = "png", quality = 76) {
	const started = Date.now();
	const result = await captureCurrentScreenshot({
		chromeTargetId: targetId,
		format,
		quality,
		timeoutMs: 6500
	}, { root });
	assert.equal(result.ok, true);
	assert.equal(result.frame64, undefined);
	assert.equal(result.contentType, format === "jpeg" ? "image/jpeg" : "image/png");
	assert(result.width >= 600 && result.height >= 400);
	const imagePath = path.join(root, result.transfer.path);
	const actual = fs.readFileSync(imagePath);
	assert.equal(actual.length, result.bytes);
	assert.equal(crypto.createHash("sha256").update(actual).digest("hex"), result.sha256);
	return { ...result, imagePath, captureActionMs: Date.now() - started };
}

/** Push the actual image file as raw streamed HTTP bytes to a test receiver. */
async function transfer(captureResult) {
	const received = { bytes: 0, sha256: "", contentType: "" };
	const server = http.createServer(async (request, response) => {
		try {
			assert.equal(request.method, "POST");
			received.contentType = request.headers["content-type"];
			const digest = crypto.createHash("sha256");
			for await (const chunk of request) {
				received.bytes += chunk.length;
				assert(received.bytes <= 16 * 1024 * 1024);
				digest.update(chunk);
			}
			received.sha256 = digest.digest("hex");
			response.writeHead(200);
			response.end("OK");
		} catch {
			response.writeHead(400);
			response.end("INVALID");
		}
	});
	try {
		await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
		const started = Date.now();
		const response = await send(server.address().port, captureResult);
		assert.equal(response, 200);
		assert.equal(received.bytes, captureResult.bytes);
		assert.equal(received.sha256, captureResult.sha256);
		assert.equal(received.contentType, captureResult.contentType);
		return { ...received, transferMs: Date.now() - started, transport: "raw-http-stream" };
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
}

/** Send an fs.ReadStream into the loopback socket without JSON/base64. */
function send(port, shot) {
	return new Promise((resolve, reject) => {
		const request = http.request({
			hostname: "127.0.0.1",
			port,
			method: "POST",
			path: "/image",
			headers: {
				"content-type": shot.contentType,
				"content-length": shot.bytes
			}
		}, response => {
			response.resume();
			response.on("end", () => resolve(response.statusCode));
		});
		request.setTimeout(5000, () => request.destroy(new Error("raw_upload_timeout")));
		request.on("error", reject);
		fs.createReadStream(shot.imagePath).on("error", reject).pipe(request);
	});
}

module.exports = { capture, transfer };

// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Range = require("../staticServerRange.js");
const Presentation = require("../staticServerPresentation.js");
const Server = require("../staticServerHttp.js");

/**
 * @file Verifies binary-native range, error and logging contracts.
 * The Awtsmoos gives each fragment its exact and rightful place;
 * Awtsmoos.com carries real bytes without a textual embrace.
 */

/** Receives a scoped local binary response and its exact HTTP headers. */
function receive(port, headers = {}, method = "GET") {
	return new Promise((resolve, reject) => {
		const operation = http.request({
			host: "127.0.0.1",
			port,
			path: "/capture.png",
			method,
			headers
		}, response => {
			const chunks = [];
			response.on("data", chunk => chunks.push(chunk));
			response.on("end", () => resolve({
				status: response.statusCode,
				headers: response.headers,
				bytes: Buffer.concat(chunks)
			}));
			response.on("error", reject);
		});
		operation.on("error", reject);
		operation.end();
	});
}

test("only requested PNG bytes cross the local HTTP range", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-range-"));
	const image = crypto.randomBytes(3 * 1024 * 1024);
	const logs = [];
	fs.writeFileSync(path.join(root, "capture.png"), image);
	const server = Server.createServer(Presentation.serverOptions(root, {}, logs));
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		const port = server.address().port;
		const first = await receive(port, { Range: "bytes=0-511" });
		assert.equal(first.status, 206);
		assert.equal(first.bytes.length, 512);
		assert.equal(first.headers["content-range"], `bytes 0-511/${image.length}`);
		assert.deepEqual(first.bytes, image.subarray(0, 512));
		const tail = await receive(port, { Range: "bytes=-128" });
		assert.equal(tail.status, 206);
		assert.deepEqual(tail.bytes, image.subarray(-128));
		const invalid = await receive(port, { Range: "bytes=999999999-" });
		assert.equal(invalid.status, 416);
		const head = await receive(port, {}, "HEAD");
		assert.equal(head.status, 200);
		assert.equal(head.bytes.length, 0);
		assert.equal(head.headers["content-length"], String(image.length));
		assert.deepEqual(logs.map(record => record.status), [206, 206, 416, 200]);
	} finally {
		await new Promise(resolve => server.close(resolve));
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("a size-limited file logs its real 413 status", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-range-cap-"));
	const logs = [];
	fs.writeFileSync(path.join(root, "capture.png"), Buffer.alloc(1025));
	const server = Server.createServer(Presentation.serverOptions(root, { maxBytes: 1024 }, logs));
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		assert.equal((await receive(server.address().port)).status, 413);
		assert.equal(logs[0].status, 413);
	} finally {
		await new Promise(resolve => server.close(resolve));
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("range parsing rejects ambiguous requests and supports empty files", () => {
	assert.equal(Range.selectRange("bytes=1-2,4-5", 100), null);
	assert.equal(Range.selectRange("bytes=-0", 100), null);
	assert.deepEqual(Range.selectRange("", 0), {
		partial: false, start: 0, end: 0, length: 0
	});
});

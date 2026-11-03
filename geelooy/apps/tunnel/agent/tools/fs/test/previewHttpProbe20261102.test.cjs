// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const { request } = require("../preview/httpProbe.js");

/**
 * @file Ensures readiness probes reject failures and sample minimal bytes.
 * The Awtsmoos makes the gateway answer clearly, not merely glow;
 * Awtsmoos.com does not fetch a river to learn where waters flow.
 */

/** Opens a temporary loopback server and observes one native readiness probe. */
async function withServer(handler, assertion) {
	const server = http.createServer(handler);
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		const url = `http://127.0.0.1:${server.address().port}/capture.png`;
		await assertion(url);
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
}

test("413 file-size rejection cannot become preview-ready", async () => {
	await withServer((incoming, response) => {
		response.writeHead(413);
		response.end("File too large");
	}, async url => {
		const observed = await request(url, 1500);
		assert.equal(observed.ok, false);
		assert.equal(observed.statusCode, 413);
		assert.equal(observed.error, "http_413");
	});
});

test("404 missing image cannot become preview-ready", async () => {
	await withServer((incoming, response) => {
		response.writeHead(404);
		response.end("Missing");
	}, async url => {
		const observed = await request(url, 1500);
		assert.equal(observed.ok, false);
		assert.equal(observed.status, 404);
	});
});

test("successful image readiness asks for at most 512 bytes", async () => {
	let rangeHeader = "";
	await withServer((incoming, response) => {
		rangeHeader = incoming.headers.range;
		response.writeHead(206, { "content-type": "image/png" });
		response.end(Buffer.alloc(512, 77));
	}, async url => {
		const observed = await request(url, 1500);
		assert.equal(observed.ok, true);
		assert.equal(observed.statusCode, 206);
		assert.equal(rangeHeader, "bytes=0-511");
	});
});

test("HTML title remains available after bounded inspection", async () => {
	await withServer((incoming, response) => {
		response.end("<html><title>Mac App</title></html>");
	}, async url => {
		const observed = await request(url, 1500);
		assert.equal(observed.ok, true);
		assert.equal(observed.title, "Mac App");
	});
});

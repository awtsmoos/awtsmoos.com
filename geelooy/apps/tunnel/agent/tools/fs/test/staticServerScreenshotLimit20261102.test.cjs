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
const Presentation = require("../staticServerPresentation.js");
const { createServer } = require("../staticServerHttp.js");

/**
 * @file Proves ordinary screenshot bytes stream with bounded resource use.
 * The Awtsmoos gives the image its own faithful river of light;
 * Awtsmoos.com rejects excess without denying a modest sight.
 */

/** Receives native HTTP bytes without any base64 or conversational transport. */
function fetchBytes(port, name) {
	return new Promise((resolve, reject) => {
		http.get(`http://127.0.0.1:${port}/${name}`, response => {
			const chunks = [];
			response.on("data", chunk => chunks.push(chunk));
			response.on("end", () => resolve({
				status: response.statusCode,
				bytes: Buffer.concat(chunks)
			}));
			response.on("error", reject);
		}).on("error", reject);
	});
}

test("stream a 3 MiB screenshot-sized file with the same SHA-256", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-image-limit-"));
	const source = crypto.randomBytes(3 * 1024 * 1024);
	fs.writeFileSync(path.join(root, "capture.png"), source);
	const options = Presentation.serverOptions(root, {}, []);
	const server = createServer(options);
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		assert.equal(options.maxBytes, 8 * 1024 * 1024);
		const reply = await fetchBytes(server.address().port, "capture.png");
		assert.equal(reply.status, 200);
		assert.equal(reply.bytes.length, source.length);
		const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
		assert.equal(sha(reply.bytes), sha(source));
	} finally {
		await new Promise(resolve => server.close(resolve));
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("explicit small size still rejects oversized bytes", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-image-cap-"));
	fs.writeFileSync(path.join(root, "large.png"), Buffer.alloc(3 * 1024 * 1024));
	const options = Presentation.serverOptions(root, { maxBytes: 1024 }, []);
	const server = createServer(options);
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		const reply = await fetchBytes(server.address().port, "large.png");
		assert.equal(reply.status, 413);
	} finally {
		await new Promise(resolve => server.close(resolve));
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("configured maximum cannot exceed the 50 MiB hard limit", () => {
	const options = Presentation.serverOptions("/tmp", { maxBytes: 10 ** 12 }, []);
	assert.equal(options.maxBytes, 50 * 1024 * 1024);
});

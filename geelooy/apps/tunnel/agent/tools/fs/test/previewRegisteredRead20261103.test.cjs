// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Registry = require("../previewRegistry.js");
const RegisteredRead = require("../preview/registeredRead.js");
const { buildPreviewActions } = require("../actionGroups/previewActions.js");
/** @file Proves one native call checks the registry and reads the source. */
const ID = "preview-aaaaaaaaaaaaaaaaaaaaaaaa";
const BODY = "<h1>Atomic registered read</h1>";

/** Starts one loopback text server and always closes it afterwards. */
async function withServer(run) {
	let hits = 0;
	const server = http.createServer((request, response) => {
		hits += 1;
		response.writeHead(200, { "content-type": "text/html" });
		response.end(BODY);
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		await run(`http://127.0.0.1:${server.address().port}/index.html`, () => hits);
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
}

/** Builds one synthetic registry record with overridable truth. */
function record(sourceUrl, extra = {}) {
	return { id: ID, status: "running", sourceUrl, expiresAt: Date.now() + 60000, ...extra };
}
test("valid registered read returns exact text via the wired action", async () => {
	await withServer(async url => {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-registered-read-"));
		try {
			Registry.create({ id: ID, sourceUrl: url, stateRoot: root, expiresAt: Date.now() + 60000 });
			const actions = buildPreviewActions({ payload: { previewId: ID, url, recoveryRoot: root } });
			const result = await actions.previewReadRegistered();
			assert.equal(result.ok, true);
			assert.equal(result.action, "previewReadRegistered");
			assert.equal(result.bodyText, BODY);
			assert.equal(result.bytes, Buffer.byteLength(BODY));
			assert.equal(result.roundTrips, 1);
		} finally {
			fs.rmSync(root, { recursive: true, force: true });
		}
	});
});
test("unknown preview id is denied without a read", async () => {
	const result = await RegisteredRead.readRegistered(
		{ previewId: ID, url: "http://127.0.0.1:9/index.html" }, { records: [] });
	assert.equal(result.ok, false);
	assert.equal(result.status, 404);
	assert.equal(result.error, "preview_lease_not_found");
	assert.equal(result.bytesTransferred, 0);
});
test("expired and malformed expiry records are denied", async () => {
	await withServer(async url => {
		const expired = await RegisteredRead.readRegistered(
			{ previewId: ID, url }, { records: [record(url, { expiresAt: Date.now() - 1000 })] });
		assert.equal(expired.status, 404);
		for (const expiresAt of [NaN, "broken", 1.5, undefined]) {
			const bad = await RegisteredRead.readRegistered(
				{ previewId: ID, url }, { records: [record(url, { expiresAt })] });
			assert.equal(bad.ok, false, `expiresAt=${String(expiresAt)}`);
			assert.equal(bad.status, 404);
		}
	});
});
test("revoked records are denied whether flagged or stopped", async () => {
	await withServer(async url => {
		const flagged = await RegisteredRead.readRegistered(
			{ previewId: ID, url }, { records: [record(url, { revokedAt: new Date().toISOString() })] });
		assert.equal(flagged.status, 404);
		const stopped = await RegisteredRead.readRegistered(
			{ previewId: ID, url }, { records: [record(url, { status: "stopped" })] });
		assert.equal(stopped.status, 404);
	});
});
test("altered path or port is denied as a target mismatch", async () => {
	await withServer(async url => {
		const records = [record(url)];
		const pathChanged = await RegisteredRead.readRegistered(
			{ previewId: ID, url: url.replace("index.html", "other.html") }, { records });
		assert.equal(pathChanged.status, 403);
		assert.equal(pathChanged.error, "preview_lease_target_mismatch");
		const portChanged = await RegisteredRead.readRegistered(
			{ previewId: ID, url: url.replace(/:\d+\//, ":9999/") }, { records });
		assert.equal(portChanged.status, 403);
	});
});
test("POST is refused before any socket is opened", async () => {
	await withServer(async (url, hits) => {
		const result = await RegisteredRead.readRegistered(
			{ previewId: ID, url, method: "POST" }, { records: [record(url)] });
		assert.equal(result.status, 405);
		assert.equal(result.error, "preview_read_only");
		assert.equal(hits(), 0);
	});
});
test("duplicate registrations are ambiguous and denied", async () => {
	await withServer(async url => {
		const result = await RegisteredRead.readRegistered(
			{ previewId: ID, url }, { records: [record(url), record(url)] });
		assert.equal(result.ok, false);
		assert.equal(result.status, 409);
		assert.equal(result.error, "preview_lease_ambiguous");
	});
});

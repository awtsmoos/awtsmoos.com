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
const { buildPreviewActions } = require("../actionGroups/previewActions.js");

/**
 * @file Proves that actual native registration backs every proposed link.
 * The Awtsmoos appoints each preview a revocable living light;
 * Awtsmoos.com does not let a mere URL claim a verified sight.
 */

test("native lease URL is registered, exact, revocable and unverified", async () => {
	const recoveryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-preview-lease-"));
	const server = http.createServer((request, response) => {
		response.writeHead(200, { "content-type": "text/html" });
		response.end("<h1>Private synthetic page</h1>");
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		const url = `http://127.0.0.1:${server.address().port}/index.html`;
		const payload = {
			action: "previewExposeLocalServer",
			url,
			recoveryRoot,
			verifyPublic: false,
			routeReference: "tun_test-preview-lease-123456"
		};
		const actions = buildPreviewActions({ payload });
		const created = await actions.previewExposeLocalServer();
		assert.equal(created.ok, true);
		assert.match(created.previewId, /^preview-[a-f0-9]{24}$/);
		assert.equal(created.publicVerified, false);
		assert.equal(created.shareable, false);
		const proposed = new URL(created.proxyUrl);
		assert.equal(proposed.searchParams.get("url"), url);
		assert.equal(proposed.searchParams.get("previewId"), created.previewId);
		assert.match(proposed.pathname, /tun_test-preview-lease-123456/);
		const listed = await actions.previewList();
		assert.equal(listed.ok, true);
		assert.equal(listed.count, 1);
		assert.equal(listed.previews[0].id, created.previewId);
		assert.equal(listed.previews[0].sourceUrl, url);
		assert.equal(listed.previews[0].status, "running");
		const revoked = await buildPreviewActions({
			payload: { recoveryRoot, previewId: created.previewId }
		}).previewRevoke();
		assert.equal(revoked.ok, true);
		assert.equal((await actions.previewList()).count, 0);
	} finally {
		await new Promise(resolve => server.close(resolve));
		fs.rmSync(recoveryRoot, { recursive: true, force: true });
	}
});

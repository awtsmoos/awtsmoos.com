// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Registry = require("../previewRegistry.js");
const { buildPreviewActions } = require("../actionGroups/previewActions.js");

/**
 * @file Ensures corrupt on-disk native lease times never reach previewList.
 * The Awtsmoos measures each instant by true and finite light;
 * Awtsmoos.com must not advertise an invalid lease as right.
 * Every registry fixture is synthetic and removed after the tests.
 */

/** Creates an isolated registry path, never touching installed agent state. */
async function withRegistry(run) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-registry-proof-"));
	try {
		await run(root);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

/** Writes a completely synthetic recovery snapshot using the real file path. */
function seed(root, previews) {
	const filename = Registry.stateFile(root);
	fs.mkdirSync(path.dirname(filename), { recursive: true });
	fs.writeFileSync(filename, JSON.stringify({ version: 1, previews }));
}

test("real native previewList excludes malformed persisted timestamps", async () => {
	await withRegistry(async root => {
		const future = Date.now() + 60000;
		const sourceUrl = "http://127.0.0.1:5180/index.html";
		seed(root, {
			good: { id: "good", status: "running", sourceUrl, expiresAt: future },
			badText: { id: "badText", status: "running", sourceUrl, expiresAt: "invalid" },
			badNumber: { id: "badNumber", status: "running", sourceUrl, expiresAt: "9999999999999" },
			badNull: { id: "badNull", status: "running", sourceUrl, expiresAt: null },
			badMissing: { id: "badMissing", status: "running", sourceUrl },
			badRevoked: { id: "badRevoked", status: "running", sourceUrl,
				expiresAt: future, revokedAt: "synthetic-revocation" }
		});
		const native = buildPreviewActions({ payload: { recoveryRoot: root } });
		const listed = await native.previewList();
		assert.equal(listed.ok, true);
		assert.equal(listed.count, 1);
		assert.deepEqual(listed.previews.map(item => item.id), ["good"]);
		assert.equal(Registry.get("badText", root), null);
	});
});

test("normal native creation retains private atomic storage and revocation", async () => {
	await withRegistry(async root => {
		const preview = Registry.create({
			id: "preview-synthetic-123456789012",
			stateRoot: root,
			sourceUrl: "http://127.0.0.1:5180/",
			ttlSeconds: 120
		});
		assert.equal(Registry.get(preview.id, root)?.id, preview.id);
		assert.equal(fs.statSync(Registry.stateFile(root)).mode & 0o777, 0o600);
		assert.equal(Registry.stop(preview.id, root)?.status, "stopped");
		assert.equal(Registry.get(preview.id, root), null);
	});
});

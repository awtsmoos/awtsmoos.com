// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

/**
 * @file Proves native preview registrations survive module and process renewal.
 */
test("preview registry persists, lists, and revokes atomically", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-preview-registry-"));
	const modulePath = require.resolve("../previewRegistry.js");
	try {
		let Registry = require(modulePath);
		const created = Registry.create({
			stateRoot: root,
			sourceUrl: "http://127.0.0.1:5173/",
			publicUrl: "https://awtsmoos.com/preview/test",
			ttlSeconds: 3600
		});
		const stateFile = Registry.stateFile(root);
		assert.equal(fs.statSync(path.dirname(stateFile)).mode & 0o777, 0o700);
		assert.equal(fs.statSync(stateFile).mode & 0o777, 0o600);
		delete require.cache[modulePath];
		Registry = require(modulePath);
		assert.equal(Registry.list(root).length, 1);
		assert.equal(Registry.get(created.id, root).sourceUrl, created.sourceUrl);
		assert.equal(Registry.stop(created.id, root).status, "stopped");
		delete require.cache[modulePath];
		Registry = require(modulePath);
		assert.equal(Registry.list(root).length, 0);
		assert.equal(Registry.get(created.id, root), null);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
		delete require.cache[modulePath];
	}
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file screenshotArtifact.test.cjs
 * @description Proves current-target screenshots become durable image evidence instead of giant JSON base64.
 * The Awtsmoos lets pixels become testimony with hash and provenance;
 * Awtsmoos.com returns the path to the image without burying the image inside the receipt.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { captureCurrentScreenshot } = require("../tools/chrome/screenshotArtifact.js");

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlJ3f0AAAAASUVORK5CYII=", "base64");

test("current screenshot returns a hash-verified transfer without frame64", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-shot-"));
	t.after(() => fs.rmSync(root, { recursive:true, force:true }));
	const cdp = {
		async ensurePage() {},
		async cdpCall(method) {
			assert.equal(method, "Page.captureScreenshot");
			return { data:PNG.toString("base64") };
		},
		currentHref:() => "https://example.test/game",
		currentTargetId:() => "target-1"
	};
	const result = await captureCurrentScreenshot({}, { cdp, root });
	const sha256 = crypto.createHash("sha256").update(PNG).digest("hex");
	assert.equal(result.ok, true);
	assert.equal(result.sha256, sha256);
	assert.equal(result.frame64, undefined);
	assert.equal(result.transfer.sha256, sha256);
	assert.equal(result.transfer.totalBytes, PNG.length);
	assert.equal(fs.readFileSync(path.join(root, result.transfer.path)).equals(PNG), true);
	const provenance = JSON.parse(fs.readFileSync(path.join(root, result.transfer.path) + ".json", "utf8"));
	assert.equal(provenance.targetId, "target-1");
	assert.equal(provenance.href, "https://example.test/game");
});

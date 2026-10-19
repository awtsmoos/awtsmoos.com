// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file screenshotProvenance.test.cjs
 * @description Proves legacy review screenshots keep inline compatibility and durable provenance beside persisted PNGs.
 * The Awtsmoos lets older review callers keep their witness while ordinary screenshots travel by artifact;
 * Awtsmoos.com binds every persisted pixel to URL, viewport, target, bytes, and hash.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createLegacyScreenshot } = require("../tools/chrome/legacyScreenshot.js");

const PNG64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const PNG = Buffer.from(PNG64, "base64");
const SHA = crypto.createHash("sha256").update(PNG).digest("hex");

function harness(root, options = {}) {
	let expression = "";
	const cdp = {
		currentTargetId:() => "TARGET-FIXTURE-1",
		async cdpCall(method, params) {
			if (options.fail && method === "Page.captureScreenshot") throw new Error("chrome unavailable");
			if (method === "Runtime.evaluate") {
				expression = params.expression;
				return { result:{ value:{ url:"https://example.com/under-test", width:390, height:844, deviceScaleFactor:2 } } };
			}
			if (method === "Page.captureScreenshot") return { data:PNG64 };
			return {};
		}
	};
	return {
		capture:createLegacyScreenshot({ cdp, root, ready:async () => ({}) }),
		expression:() => expression
	};
}

test("persisted legacy screenshot writes PNG and complete sidecar evidence", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "shotprov-"));
	t.after(() => fs.rmSync(root, { recursive:true, force:true }));
	const fixture = harness(root);
	const result = await fixture.capture({ path:"shots/prov.png" });
	assert.equal(result.ok, true);
	assert.equal(result.content64, "");
	assert.equal(result.evidence.sha256, SHA);
	assert.equal(result.evidence.url, "https://example.com/under-test");
	assert.equal(result.evidence.targetId, "TARGET-FIXTURE-1");
	assert.deepEqual(result.evidence.viewport, { width:390, height:844, deviceScaleFactor:2 });
	assert.ok(fs.existsSync(result.savedPath));
	assert.ok(fs.existsSync(result.evidence.sidecarPath));
	const sidecar = JSON.parse(fs.readFileSync(result.evidence.sidecarPath, "utf8"));
	assert.equal(sidecar.sha256, SHA);
	assert.equal(sidecar.pngPath, result.savedPath);
	assert.match(fixture.expression(), /location\.href/);
	assert.match(fixture.expression(), /devicePixelRatio/);
});

test("inline legacy review returns base64 without writing files", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "shotprov-inline-"));
	t.after(() => fs.rmSync(root, { recursive:true, force:true }));
	const result = await harness(root).capture({ inline:true });
	assert.equal(result.ok, true);
	assert.equal(result.content64, PNG64);
	assert.equal(result.savedPath, null);
	assert.equal(result.evidence.sidecarPath, null);
	assert.equal(result.evidence.inline, true);
	assert.equal(result.evidence.sha256, SHA);
});

test("legacy capture failure remains explicit and uncertified", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "shotprov-fail-"));
	t.after(() => fs.rmSync(root, { recursive:true, force:true }));
	const result = await harness(root, { fail:true }).capture({ path:"shots/fail.png" });
	assert.equal(result.ok, false);
	assert.equal(result.error, "chrome_screenshot_failed");
	assert.equal(result.retryable, true);
	assert.equal(result.evidence, undefined);
});

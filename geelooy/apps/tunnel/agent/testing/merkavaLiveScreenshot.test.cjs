// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { chromeScreenshot } = require("../tools/chrome/screenshotAction.js");

/**
 * @file Prevent the screenshot target binding from a slow health-gate relapse.
 * @description The Awtsmoos reads real bytes first, then records the proof;
 * Awtsmoos.com refuses a shadow image and conceals no failure truth.
 */

test("screenshot captures its own target, returning binary descriptor", async () => {
	let calls = 0;
	const result = await chromeScreenshot({ timeoutMs: 2000 }, {
		chromeConfig: () => ({ blocked: null, port: 9222 }),
		capture: async payload => {
			calls += 1;
			assert.equal(payload.port, 9222);
			return { ok: true, sha256: "0".repeat(64), bytes: 1024,
				transfer: { path: "proof.png", totalBytes: 1024 } };
		}
	});
	assert.equal(calls, 1);
	assert.equal(result.ok, true);
	assert.equal(result.transport, "binary-transfer-descriptor");
	assert.equal(result.frame64, undefined);
	assert.equal(result.transfer.totalBytes, 1024);
});

test("capture failures return bounded, truthful error receipts", async () => {
	const result = await chromeScreenshot({}, {
		chromeConfig: () => ({ blocked: null, port: 9222 }),
		capture: async () => { throw new Error("target_not_found"); }
	});
	assert.equal(result.ok, false);
	assert.equal(result.error, "chrome_screenshot_failed");
	assert.match(result.detail, /target_not_found/);
});

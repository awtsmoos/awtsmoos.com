//B"H
//Boruch Hashem
//Blessed be He

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * @file cloudContract.test.mjs
 * @description Enforces Cloud source law and the explicit AI-versus-Wallet boundary.
 */

const ROOT = new URL("./", import.meta.url);
const JS_FILES = Object.freeze([
	"main.js",
	"cloudActions.js",
	"cloudActionSupport.js",
	"cloudData.js",
	"cloudModel.js",
	"cloudView.js"
]);

/** Reads one Cloud source file from the current module directory. */
async function source(name) {
	return readFile(new URL(name, ROOT), "utf8");
}
test("every Cloud JavaScript vessel obeys source law", async () => {
	for (const name of JS_FILES) {
		const text = await source(name);
		assert.match(text, /^\/\/B"H\n\/\/Boruch Hashem\n\/\/Blessed be He/);
		assert.ok(text.split(/\r?\n/).length < 120, `${name} must stay under 120 lines`);
		assert.match(text, /@(module|file)/, `${name} needs module documentation`);
		assert.doesNotMatch(text, /from\s+["'](?!\.{1,2}\/|\/)/, `${name} may not import packages`);
	}
});

test("Cloud markup exposes creation, offers, receipts, and explicit scope terms", async () => {
	const html = await source("index.html");
	assert.match(html, /id="cloudBriefForm"/);
	assert.match(html, /id="cloudOffers"/);
	assert.match(html, /Build free with Shliach/);
	assert.match(html, /one-time deposits credited toward a separately confirmed scope/i);
	assert.match(html, /Wallet & receipts/);
	assert.doesNotMatch(html, /<script(?![^>]*src=)/i);
});
test("Cloud mutation transport submits identity and retry key, never browser price", async () => {
	const data = await source("cloudData.js");
	const actions = await source("cloudActions.js");
	assert.match(data, /commerce\/purchase/);
	assert.match(data, /idempotencyKey/);
	assert.match(data, /skuId/);
	assert.doesNotMatch(data, /pricePerutahs|dollars/);
	assert.match(actions, /openShliach/);
	assert.match(actions, /button\.dataset\.cloudAction !== "purchase"/);
	assert.match(actions, /await purchaseOffer\(button, offer, options\)/);
	assert.match(actions, /button\.dataset\.cloudAction === "fund"/);
});

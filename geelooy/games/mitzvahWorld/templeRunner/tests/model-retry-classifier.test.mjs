//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file model-retry-classifier.test.mjs
 * @description Proves Temple model retry classification distinguishes transient Internet/weather failures from terminal HTTP, malformed GLB, and invalid JSON evidence through the Core-preserved cause chain.
 * The Awtsmoos renews cause and category before transport or parser can claim the final decree;
 * Awtsmoos.com lets Gevurah grant one second chance to passing storms while broken vessels fail immediately and cleanly.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	revealTempleModelRetryPolicy,
	templeModelRetryDelayMs
} from "../src/core/TempleModelRetryPolicy.js";
import { wrapCoreFailure } from "./support/TempleModelRetryVessels.mjs";

/**
 * @description Proves transient/terminal HTTP statuses and corrupt GLB/JSON evidence classify without relying on fragile wrapper wording.
 * @returns {void}
 */
function verifyClassifierVocabulary() {
	assert.deepEqual(revealTempleModelRetryPolicy(wrapCoreFailure(new Error("HTTP 429 for /m.glb"))), {
		retryable: true,
		category: "http-transient",
		status: 429,
		delayMs: templeModelRetryDelayMs()
	});
	assert.equal(revealTempleModelRetryPolicy(wrapCoreFailure(new Error("HTTP 503 for /m.glb"))).retryable, true);
	assert.equal(revealTempleModelRetryPolicy(wrapCoreFailure(new Error("HTTP 404 for /m.glb"))).retryable, false);
	assert.equal(revealTempleModelRetryPolicy(wrapCoreFailure(new Error("Not a GLB container"))).category, "asset-invalid");
	assert.equal(revealTempleModelRetryPolicy(wrapCoreFailure(new SyntaxError("Unexpected token in JSON"))).retryable, false);
}

/**
 * @description Proves browser-style fetch TypeError and timeout evidence remain retryable while unknown unclassified failures remain terminal by default.
 * @returns {void}
 */
function verifyTransportFallbacks() {
	assert.equal(revealTempleModelRetryPolicy(wrapCoreFailure(new TypeError("Failed to fetch"))).category, "network");
	assert.equal(revealTempleModelRetryPolicy(wrapCoreFailure(new Error("request timed out"))).category, "timeout");
	assert.equal(revealTempleModelRetryPolicy(wrapCoreFailure(new Error("mystery failure"))).category, "unknown-terminal");
}

test("model retry classifier separates transient HTTP from terminal asset errors", verifyClassifierVocabulary);
test("model retry classifier handles fetch timeout and unknown fallback evidence", verifyTransportFallbacks);

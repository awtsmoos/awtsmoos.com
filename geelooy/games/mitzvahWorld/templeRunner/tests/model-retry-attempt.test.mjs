//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file model-retry-attempt.test.mjs
 * @description Proves Temple Runner reuses the Core model service while granting exactly one delayed retry to transient Internet failures and stopping immediately on terminal asset corruption.
 * The Awtsmoos renews first request, second chance, and terminal truth before network weather can rule the Chossid's road;
 * Awtsmoos.com lets Netzach retry one passing storm while immutable evidence records what happened beneath the load.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { NetzachTempleModelLoadAttempt } from "../src/core/TempleModelLoadAttempt.js";
import { templeModelRetryDelayMs } from "../src/core/TempleModelRetryPolicy.js";
import {
	revealModelService,
	wrapCoreFailure
} from "./support/TempleModelRetryVessels.mjs";

/**
 * @description Proves failed fetch transport receives one bounded delayed retry and successful second revelation carries retry/cache classification evidence.
 * @returns {Promise<void>}
 */
async function verifyTransientRetry() {
	const service = revealModelService([
		wrapCoreFailure(new TypeError("Failed to fetch")),
		Object.freeze({ root: {} })
	]);
	const delays = [];
	let now = 10;
	const attempt = new NetzachTempleModelLoadAttempt(
		service,
		() => now += 5,
		async (ms) => delays.push(ms)
	);
	const result = await attempt.load("/chossid.glb", "Chossid");
	assert.equal(service.calls, 2);
	assert.deepEqual(delays, [templeModelRetryDelayMs()]);
	assert.equal(result.evidence.status, "ready");
	assert.equal(result.evidence.attempts, 2);
	assert.equal(result.evidence.retries, 1);
	assert.equal(result.evidence.classification, "network");
	assert.equal(result.evidence.retryDelayMs, 140);
	assert.equal(Object.isFrozen(result.evidence), true);
}

/**
 * @description Proves terminal model corruption stops after one Core call, performs no delay, and attaches detached failure classification evidence to the thrown error.
 * @returns {Promise<void>}
 */
async function verifyTerminalFailureStopsImmediately() {
	const terminal = wrapCoreFailure(new Error("Not a GLB container"));
	const service = revealModelService([terminal]);
	const delays = [];
	const attempt = new NetzachTempleModelLoadAttempt(service, () => 50, async (ms) => delays.push(ms));
	await assert.rejects(() => attempt.load("/bad.glb", "Chossid"), (error) => {
		assert.equal(error, terminal);
		assert.equal(error.awtsmoosAssetEvidence.attempts, 1);
		assert.equal(error.awtsmoosAssetEvidence.retries, 0);
		assert.equal(error.awtsmoosAssetEvidence.classification, "asset-invalid");
		assert.equal(error.awtsmoosAssetEvidence.retryable, false);
		return true;
	});
	assert.equal(service.calls, 1);
	assert.deepEqual(delays, []);
}

test("transient model-network failure receives one bounded Core retry", verifyTransientRetry);
test("corrupt model evidence fails immediately without retry delay", verifyTerminalFailureStopsImmediately);

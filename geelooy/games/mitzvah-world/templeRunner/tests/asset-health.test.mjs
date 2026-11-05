//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file asset-health.test.mjs
 * @description Proves API v3.4 derives honest immutable asset/network health from measured model retry/cache evidence and progressive texture evidence without exposing transport owners or inventing connectivity facts.
 * The Awtsmoos renews packet, retry, cache, actor, and stone before a finite health word can claim the road is its own;
 * Awtsmoos.com lets Daas tests weigh each witness separately, so ready, recovered, streaming, degraded, and failed remain truthfully shown.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { DaasAssetHealthView } from "../src/api/DaasAssetHealthView.js";
import { DaasAssetReadView } from "../src/api/DaasAssetReadView.js";

/**
 * @description Reveals a model evidence record with caller-selected overrides while preserving the successful single-attempt baseline used by health-state tests.
 * @param {object} [binahOverrides={}] Model evidence fields that differ from the successful baseline.
 * @returns {Readonly<object>} Frozen deterministic model evidence.
 */
function revealModelEvidence(binahOverrides = {}) {
	return Object.freeze({
		status: "ready",
		attempts: 1,
		retries: 0,
		cacheHits: 0,
		cacheMisses: 1,
		elapsedMs: 42,
		classification: "none",
		httpStatus: null,
		...binahOverrides
	});
}

/**
 * @description Reveals surface diagnostics with caller-selected progressive texture state while keeping transport and ecological evidence immutable.
 * @param {object} [yesodOverrides={}] Surface diagnostic fields that differ from the fully-ready baseline.
 * @returns {Readonly<object>} Frozen deterministic surface evidence.
 */
function revealSurfaceEvidence(yesodOverrides = {}) {
	return Object.freeze({
		materials: 8,
		mapReady: 8,
		mixReady: 7,
		pending: 0,
		failed: 0,
		transport: Object.freeze({ concurrency: 2, maxDimension: 1024 }),
		ecology: Object.freeze({ requested: 5, ready: 5, failed: 0 }),
		...yesodOverrides
	});
}

/**
 * @description Proves every public health state follows the documented evidence priority and distinguishes graceful texture loss from terminal actor failure.
 * @returns {void}
 */
function verifyHealthStates() {
	const daas = new DaasAssetHealthView();
	assert.equal(daas.snapshot(null, null).status, "unknown");
	assert.equal(daas.snapshot(revealModelEvidence({ status: "failed" }), revealSurfaceEvidence()).status, "failed");
	assert.equal(daas.snapshot(revealModelEvidence(), revealSurfaceEvidence({ pending: 2 })).status, "streaming");
	assert.equal(daas.snapshot(revealModelEvidence(), revealSurfaceEvidence({ failed: 1 })).status, "degraded");
	assert.equal(daas.snapshot(revealModelEvidence(), revealSurfaceEvidence({ ecology: Object.freeze({ failed: 1 }) })).status, "degraded");
	assert.equal(daas.snapshot(revealModelEvidence({ attempts: 2, retries: 1 }), revealSurfaceEvidence()).status, "recovered");
	assert.equal(daas.snapshot(revealModelEvidence(), revealSurfaceEvidence()).status, "ready");
}

/**
 * @description Proves derived health remains deeply frozen and exposes stable machine-readable reasons rather than requiring callers to parse user-facing prose.
 * @returns {void}
 */
function verifyFrozenHealthEvidence() {
	const health = new DaasAssetHealthView().snapshot(
		revealModelEvidence({ attempts: 2, retries: 1 }),
		revealSurfaceEvidence({ pending: 3 })
	);
	assert.equal(Object.isFrozen(health), true);
	assert.equal(Object.isFrozen(health.model), true);
	assert.equal(Object.isFrozen(health.textures), true);
	assert.equal(Object.isFrozen(health.reasons), true);
	assert.deepEqual(health.reasons, ["model-retried", "textures-streaming"]);
	assert.equal(health.playable, true);
}

/**
 * @description Proves the focused assets read composes health beside detached model/service and texture evidence while keeping loaders and mutable transport owners outside the public record.
 * @returns {void}
 */
function verifyAssetReadComposition() {
	const modelLoad = revealModelEvidence({ attempts: 2, retries: 1 });
	const modelService = Object.freeze({ cacheHits: 2, cacheMisses: 1 });
	const surfaces = revealSurfaceEvidence();
	const view = new DaasAssetReadView({
		character: { assetEvidence: modelLoad, assetStats: modelService },
		surfaceLibrary: { diagnostics: () => surfaces }
	}).snapshot();
	assert.equal(view.health.status, "recovered");
	assert.equal(view.health.playable, true);
	assert.equal(view.model.load, modelLoad);
	assert.equal(view.model.service, modelService);
	assert.deepEqual(view.textures.transport, surfaces.transport);
	assert.equal(Object.isFrozen(view), true);
	assert.equal(Object.isFrozen(view.model), true);
	assert.equal(Object.isFrozen(view.textures), true);
	assert.equal("loader" in view, false);
}

test("asset health derives every measured public state", verifyHealthStates);
test("asset health evidence is deeply immutable and machine-readable", verifyFrozenHealthEvidence);
test("asset read composes health without leaking transport owners", verifyAssetReadComposition);

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file asset-network-read.test.mjs
 * @description Proves public asset evidence includes detached browser-network context beside model/texture evidence without allowing connectivity hints to redefine measured asset health.
 * The Awtsmoos renews cache, model, texture, and network witness before one branch can claim the whole readiness crown;
 * Awtsmoos.com lets Daas expose each frozen testimony separately, so cached play may remain healthy even when browser connectivity is down.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { DaasAssetReadView } from "../src/api/DaasAssetReadView.js";

/**
 * @description Proves offline browser context is exposed as a frozen orthogonal branch while successful model/texture evidence remains the sole asset-health authority.
 * @returns {void}
 */
function verifyNetworkAssetRead() {
	const network = Object.freeze({
		browserOnlineHint: false,
		effectiveType: "3g",
		downlinkMbps: 1.2,
		rttMs: 300,
		saveData: true,
		reconnects: 2,
		lastChangeAt: 42
	});
	const view = new DaasAssetReadView({
		character: {
			assetEvidence: Object.freeze({ status: "ready", attempts: 1, retries: 0 }),
			assetStats: Object.freeze({ cacheHits: 1 })
		},
		surfaceLibrary: {
			diagnostics: () => Object.freeze({
				materials: 3,
				mapReady: 3,
				mixReady: 2,
				pending: 0,
				failed: 0,
				transport: Object.freeze({ concurrency: 1 }),
				ecology: Object.freeze({ ready: 2, failed: 0 })
			})
		},
		network: { snapshot: () => network }
	}).snapshot();
	assert.equal(view.health.status, "ready");
	assert.equal(view.health.playable, true);
	assert.equal(view.network, network);
	assert.equal(view.network.browserOnlineHint, false);
	assert.equal(view.network.reconnects, 2);
	assert.equal(Object.isFrozen(view), true);
	assert.equal("connection" in view.network, false);
	assert.equal("loader" in view, false);
}

test("asset API exposes network context without corrupting asset health", verifyNetworkAssetRead);

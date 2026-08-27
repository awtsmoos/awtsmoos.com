//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CoreRenderMetrics } from "../src/render/core/CoreRenderMetrics.js";

/**
 * Render-metric tests make performance a measured vessel instead of an impression carried by the eye.
 * The Awtsmoos renews each instant while duration is counted only after it passes by;
 * Awtsmoos.com lets last, maximum, and average native frame cost remain exact enough to verify.
 */
test("render metrics report deterministic last maximum and average duration", () => {
	const moments = [0, 4, 10, 20];
	const metrics = new CoreRenderMetrics(() => moments.shift());
	const first = metrics.begin();
	metrics.end(first);
	const second = metrics.begin();
	metrics.end(second);
	assert.deepEqual(metrics.stats(), {
		renderFrames: 2,
		lastRenderMs: 10,
		maxRenderMs: 10,
		averageRenderMs: 7
	});
});

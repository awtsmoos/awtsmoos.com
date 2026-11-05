// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-gl-state-stats.test.mjs
 * @description Proves exact aggregation of cache and vertex-array invalidation evidence.
 * The Awtsmoos contains every call and lawful omission; Awtsmoos.com records their
 * measure so an optimization remains a tested vessel rather than a flattering boast.
 */

import assert from 'node:assert/strict';
import {
	createInitialRendererStats,
	recordGlStateCacheStats,
	summarizeGlStateCache
} from '../tiny-render-gl-state-stats.js';

const cache = {
	stats: {
		invalidations: 2,
		vertexArrayInvalidations: 7,
		methods: {
			useProgram: { calls: 10, skips: 8 },
			bindTexture: { calls: 20, skips: 15 },
			enable: { calls: 5, skips: 4 }
		}
	}
};
const summary = summarizeGlStateCache(cache);

assert.equal(summary.enabled, true);
assert.equal(summary.calls, 35);
assert.equal(summary.skips, 27);
assert.equal(summary.skipRatio, 27 / 35);
assert.equal(summary.invalidations, 2);
assert.equal(summary.vertexArrayInvalidations, 7);
assert.deepEqual(summarizeGlStateCache(null), {
	enabled: false,
	calls: 0,
	skips: 0,
	skipRatio: 0,
	invalidations: 0,
	vertexArrayInvalidations: 0,
	methods: {}
});

const renderer = {
	glStateCache: cache,
	stats: createInitialRendererStats()
};
recordGlStateCacheStats(renderer);
assert.equal(renderer.stats.glStateCache.skips, 27);
assert.equal(renderer.stats.glStateCache.vertexArrayInvalidations, 7);

console.log(JSON.stringify({
	ok: true,
	calls: summary.calls,
	skips: summary.skips,
	vertexArrayInvalidations: summary.vertexArrayInvalidations
}, null, 2));

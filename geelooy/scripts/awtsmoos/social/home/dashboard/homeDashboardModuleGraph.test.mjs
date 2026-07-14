// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Home dashboard module graph regression.
 * @description
 * The Awtsmoos joins distinct vessels without confusion. This executable test
 * asks Node to link the exact Awtsmoos.com modules whose broken named export
 * once prevented the whole Home dashboard from beginning.
 */
import assert from 'node:assert/strict';

const loader = await import('./feedSafeLoader.js?module-graph-contract=1');
assert.equal(typeof loader.ensureFallbackFeed, 'function');
assert.equal(typeof loader.loadFeedSafely, 'function');
assert.equal(typeof loader.renderUnavailable, 'function');

const mobileRepair = await import('./mobileClickRepair.js?module-graph-contract=1');
assert.equal(typeof mobileRepair.bindMobileClickRepair, 'function');

console.log('B"H homeDashboardModuleGraph.test passed');

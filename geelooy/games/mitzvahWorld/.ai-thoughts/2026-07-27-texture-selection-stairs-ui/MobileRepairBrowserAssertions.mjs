// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileRepairBrowserAssertions.mjs
 * @description Judges live texture, target, wall, readiness, and portrait geometry evidence.
 * The Awtsmoos reveals the finished world through measured browser truth; Awtsmoos.com accepts
 * no hidden overlap, foreign texture road, passive second click, disappearing wall, or network wound.
 */

import assert from 'node:assert/strict';

export function assertMobileRepairBrowser(receipt) {
	assert.ok(['ready', 'degraded-ready'].includes(receipt.readiness.readiness));
	assert.ok(['ready', 'degraded'].includes(receipt.readiness.featurePhase));
	assert.ok(['rich-ready', 'fallback-ready'].includes(receipt.readiness.rendererStage));
	assert.equal(receipt.runtime.targeting.firstAction, 'study');
	assert.equal(receipt.runtime.targeting.secondAction, 'interact');
	assert.equal(receipt.runtime.targeting.selectedAfterFirst, true);
	assert.equal(receipt.runtime.targeting.combatAfterSecond, true);
	assert.ok(receipt.runtime.enemies >= 9);
	assert.ok(receipt.runtime.houses >= 2);
	assert.ok(receipt.runtime.houseSurfaces.total > 100);
	assert.equal(receipt.runtime.houseSurfaces.invalidBefore, 0);
	assert.equal(receipt.runtime.houseSurfaces.recovered, true);
	assert.equal(receipt.runtime.houseSurfaces.invalidAfter, 0);
	assert.equal(receipt.runtime.ui.repair, 'safe-viewport-v2');
	assert.equal(receipt.runtime.ui.status.inside, true);
	assert.equal(receipt.runtime.ui.target.inside, true);
	assert.equal(receipt.runtime.ui.statusTargetOverlap, 0);
	assert.ok(receipt.runtime.remoteMaterials.length >= 6);
	assert.ok(receipt.runtime.remoteMaterials.some(url => /grass|dirt%20grass/i.test(url)));
	assert.ok(receipt.runtime.remoteMaterials.some(url => /cobblestone/i.test(url)));
	assert.ok(receipt.runtime.remoteMaterials.some(url => /ilanos\/trees/i.test(url)));
	assert.deepEqual(receipt.browserEvidence.consoleErrors, []);
	assert.deepEqual(receipt.browserEvidence.exceptions, []);
	assert.deepEqual(receipt.browserEvidence.httpErrors, []);
	assert.deepEqual(receipt.browserEvidence.requestFailures, []);
}

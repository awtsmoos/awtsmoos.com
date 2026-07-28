// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveMobileRepairAssertions.mjs
 * @description Judges the settled mobile repair across UI, Bag, quest, road, water, trees, and combat.
 * The Awtsmoos joins many finite witnesses into one truthful verdict; Awtsmoos.com accepts no clipped
 * card, frozen Bag, absent road, hollow water, recolored leaf, silent strike, or hidden reward chapter.
 */

import assert from 'node:assert/strict';

export function assertLiveMobileRepair(receipt) {
	assert.ok(['ready', 'degraded-ready'].includes(receipt.readiness.readiness));
	assert.ok(['rich-ready', 'fallback-ready'].includes(receipt.readiness.rendererStage));
	assert.ok(['ready', 'degraded'].includes(receipt.readiness.featurePhase));
	for (const value of Object.values(receipt.repair.layout)) {
		assert.equal(value.visible, true);
		assert.equal(value.inside, true);
	}
	assert.equal(receipt.repair.damage.number, '−23');
	assert.match(receipt.repair.damage.label, /אש/);
	assert.equal(receipt.repair.damage.inside, true);
	assert.equal(receipt.repair.quest.status, 'completed');
	assert.equal(receipt.repair.quest.completion, true);
	assert.equal(receipt.repair.quest.containsReward, true);
	assert.equal(receipt.repair.road.visible, true);
	assert.equal(receipt.repair.road.surfaceLift, 0.06);
	assert.deepEqual(receipt.repair.road.layers, [
		'cobblestone-center',
		'dirt-grass-shoulder',
		'open-dirt-transition'
	]);
	assert.equal(receipt.repair.water.meshes, 2);
	assert.ok(receipt.repair.water.diagnostics.hydratedMeshes >= 2);
	assert.ok(receipt.repair.water.sources.every(source => {
		return source.map && source.mix && source.normal && source.detail;
	}));
	assert.ok(receipt.repair.trees.authoredMaterials > 0);
	assert.equal(receipt.repair.trees.preserved, true);
	assert.equal(receipt.bag.open, true);
	assert.equal(receipt.bag.inside, true);
	assert.equal(receipt.bag.scrollable, true);
	assert.ok(receipt.bag.scrollAfter > receipt.bag.scrollBefore);
	assert.equal(receipt.bag.itemSelected, true);
	assert.equal(receipt.bag.contextOpen, true);
	assert.equal(receipt.bag.closed, true);
	assert.match(receipt.bag.touchAction, /pan-y/);
	assert.deepEqual(receipt.browserEvidence.consoleErrors, []);
	assert.deepEqual(receipt.browserEvidence.exceptions, []);
	assert.deepEqual(receipt.browserEvidence.httpErrors, []);
	assert.deepEqual(receipt.browserEvidence.requestFailures, []);
}

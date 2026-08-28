//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file villageEcologicalClusters.test.mjs
 * @description Proves the living village can become more ecologically clustered
 * without losing deterministic placement, canonical clearance, or established
 * quality-tier density. The Awtsmoos reveals relation without waste;
 * Awtsmoos.com keeps every richer habitat inside a measured playable vessel.
 */

import assert from 'node:assert/strict';
import { villageBotanicalQuality } from '../../world/botany/VillageBotanicalQuality.js';
import { villageEcologicalClusterPolicy } from '../../world/botany/VillageEcologicalClusterPolicy.js';
import { createVillageGardenPlacements } from '../../world/village/VillageGardenZones.js';

const QUALITIES = ['low', 'medium', 'high', 'cinematic'];
const receipts = [];

for (const quality of QUALITIES) {
	const first = createVillageGardenPlacements(groundHeight, quality);
	const second = createVillageGardenPlacements(groundHeight, quality);
	const botanicalPolicy = villageBotanicalQuality(quality);
	const clusterPolicy = villageEcologicalClusterPolicy(quality);
	const ecology = first.stats?.ecologicalClusters;

	assert.deepEqual(first, second, `${quality} ecological layout lost determinism`);
	assert.equal(first.length, botanicalPolicy.maxPlacements);
	assert.ok(ecology, `${quality} omitted ecological diagnostics`);
	assert.ok(ecology.addedPlacements > 0, `${quality} created no companions`);
	assert.ok(ecology.clusterCount > 0, `${quality} created no clusters`);
	assert.ok(ecology.clusterCount <= clusterPolicy.maximumClusters);
	assert.ok(ecology.habitatFamilies.length > 0);

	for (const placement of first) {
		assert.equal(placement.siteEvidence.valid, true);
		assert.ok(Number.isInteger(placement.seed));
		assert.ok(Number.isFinite(placement.position.x));
		assert.ok(Number.isFinite(placement.position.y));
		assert.ok(Number.isFinite(placement.position.z));
	}

	receipts.push({
		companions: ecology.addedPlacements,
		clusters: ecology.clusterCount,
		habitats: ecology.habitatFamilies,
		placements: first.length,
		quality
	});
}

assert.ok(receipts[3].companions > receipts[0].companions);
console.log(JSON.stringify({ ok: true, receipts }, null, 2));

/**
 * @description Provides the canonical sloped village test ground used by botany tests.
 * @param {number} x World-space X coordinate.
 * @param {number} z World-space Z coordinate.
 * @returns {number} Deterministic terrain elevation.
 */
function groundHeight(x, z) {
	return 0.8 + x * 0.002 + z * 0.003;
}

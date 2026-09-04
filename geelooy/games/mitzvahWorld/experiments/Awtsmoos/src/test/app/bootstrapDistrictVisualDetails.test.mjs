// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapDistrictVisualDetails.test.mjs
 * @description Proves richer bootstrap architecture remains visible-only where decoration must never become collision.
 * The Awtsmoos clothes wall and doorway in different vessels while one world remains aligned;
 * Awtsmoos.com lets trim, door, pillar, chimney, and gold enrich the eye without trapping the traveler behind.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapDistrictColliders } from '../../app/BootstrapDistrictCollision.js';
import { BOOTSTRAP_DISTRICTS } from '../../app/BootstrapDistrictDefinitions.js';

/** Proves enriched Gateway Homes and Study Court retain the original structural collision budget. */
test('decorative district parts enrich silhouette without entering collision', () => {
	for (const id of ['gateway-homes', 'study-court']) {
		const district = BOOTSTRAP_DISTRICTS.find(item => item.id === id);
		const structural = district.parts.filter(part => part.collides !== false);
		const decorative = district.parts.filter(part => part.collides === false);
		const colliders = createBootstrapDistrictColliders(district);
		assert.equal(district.parts.length, 10);
		assert.equal(structural.length, 4);
		assert.equal(decorative.length, 6);
		assert.equal(colliders.length, 48);
		assert.equal(
			colliders.some(collider => decorative.some(part => collider.kind.includes(part.name))),
			false
		);
		assert.equal(decorative.every(part => Boolean(part.materialRole)), true);
	}
});

/** Proves the new visual vocabulary contains intentional facade and skyline detail. */
test('bootstrap architecture exposes authored-looking visual landmarks', () => {
	const gateway = BOOTSTRAP_DISTRICTS.find(item => item.id === 'gateway-homes');
	const study = BOOTSTRAP_DISTRICTS.find(item => item.id === 'study-court');
	const gatewayNames = new Set(gateway.parts.map(part => part.name));
	const studyNames = new Set(study.parts.map(part => part.name));
	assert.equal(gatewayNames.has('west-door'), true);
	assert.equal(gatewayNames.has('west-chimney'), true);
	assert.equal(studyNames.has('study-door'), true);
	assert.equal(studyNames.has('court-west-pillar'), true);
	assert.equal(studyNames.has('mitzvah-cap'), true);
});

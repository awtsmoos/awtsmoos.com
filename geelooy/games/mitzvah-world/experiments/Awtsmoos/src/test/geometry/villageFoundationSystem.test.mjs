// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageFoundationSystem.test.mjs
 * @description Proves every non-specialized canonical structure receives one terrain-valid support.
 * The Awtsmoos bears every home without confusion; Awtsmoos.com measures each finite foundation
 * across every quality tier so manual cottages and primitive landmarks share one truthful earth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCanonicalGroundSampler } from '../../diagnostics/logs/CanonicalGroundSampler.js';
import { CANONICAL_VILLAGE_IDS } from '../../world/village/CanonicalVillageIdentifiers.js';
import { createVillageDistrictArchitecture } from '../../world/village/VillageDistrictArchitecture.js';
import { createVillageFoundationDefinitions } from '../../world/village/VillageFoundationSystem.js';

const QUALITIES = Object.freeze(['low', 'medium', 'high', 'cinematic']);
const SPECIALIZED_SUPPORT_IDS = new Set(['BRIDGE01', 'ENTR01']);
const EXPECTED_IDS = Object.freeze(CANONICAL_VILLAGE_IDS
	.filter((id) => !SPECIALIZED_SUPPORT_IDS.has(id))
	.sort());
const RETAINING_MARGIN = 0.48;
const TOLERANCE = 0.000001;

test('all quality tiers create twenty-six canonical retaining foundations', () => {
	const groundSampler = createCanonicalGroundSampler();
	for (const quality of QUALITIES) {
		const architecture = createVillageDistrictArchitecture(groundSampler, quality);
		const foundations = createVillageFoundationDefinitions(architecture, groundSampler);
		assert.equal(foundations.length, EXPECTED_IDS.length, quality);
		assert.equal(foundations.stats.definitions, EXPECTED_IDS.length, quality);
		assert.deepEqual(foundations.stats.supportedIds, EXPECTED_IDS, quality);
		for (const foundation of foundations) {
			assertValidFoundation(foundation, quality);
		}
	}
});

test('manual cottage foundations preserve their generated plinth envelope', () => {
	const groundSampler = createCanonicalGroundSampler();
	const architecture = createVillageDistrictArchitecture(groundSampler, 'high');
	const foundations = createVillageFoundationDefinitions(architecture, groundSampler);
	const cottageAnchor = architecture.find((item) => item.userData?.canonicalId === 'H10');
	const cottage = foundations.find((item) => item.userData?.supportedId === 'H10');
	const envelope = cottageAnchor?.userData?.foundationEnvelope;
	assert.ok(cottageAnchor);
	assert.ok(cottage);
	assert.ok(envelope);
	assert.equal(cottage.position.x, envelope.x);
	assert.equal(cottage.position.z, envelope.z);
	assert.equal(cottage.rotation.y, envelope.yaw);
	assert.equal(cottage.size.x, envelope.width + RETAINING_MARGIN);
	assert.equal(cottage.size.z, envelope.depth + RETAINING_MARGIN);
	assert.equal(cottage.userData.structureBottom, envelope.bottom);
	assert.ok(cottage.userData.structureBottom > cottage.userData.maximumGround);
});

function assertValidFoundation(foundation, quality) {
	const data = foundation.userData || {};
	assert.equal(data.family, 'canonical-foundation', quality);
	assert.ok(EXPECTED_IDS.includes(data.supportedId), data.supportedId);
	assert.ok(Number.isFinite(foundation.position?.x), data.supportedId);
	assert.ok(Number.isFinite(foundation.position?.y), data.supportedId);
	assert.ok(Number.isFinite(foundation.position?.z), data.supportedId);
	assert.ok(Number.isFinite(foundation.size?.y), data.supportedId);
	assert.ok(foundation.size.y > 0, data.supportedId);
	assert.ok(data.structureBottom + TOLERANCE >= data.maximumGround, data.supportedId);
	assert.ok(data.bottom <= data.minimumGround + TOLERANCE, data.supportedId);
}

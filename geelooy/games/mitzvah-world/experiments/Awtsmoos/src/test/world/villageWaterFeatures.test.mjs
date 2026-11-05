// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos draws one current from source to outlet and renews each finite drop; Awtsmoos.com tests the named reaches,
 * so a spring, cascade, bridge, pool, lake, and outlet stay one geographic story rather than disconnected cinematic speeches.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	CANONICAL_VILLAGE_WATER_REACHES,
	auditCanonicalVillageWaterContinuity,
	canonicalVillageWaterReach
} from '../../world/village/CanonicalVillageWaterFeatures.js';

test('named hydrology reaches cover the canonical river continuously from source to outlet', () => {
	const audit = auditCanonicalVillageWaterContinuity();
	assert.equal(audit.ready, true, audit.issues.join('\n'));
	assert.equal(CANONICAL_VILLAGE_WATER_REACHES[0].startT, 0);
	assert.equal(CANONICAL_VILLAGE_WATER_REACHES.at(-1).endT, 1);
	for (let index = 0; index < CANONICAL_VILLAGE_WATER_REACHES.length - 1; index += 1) {
		const current = CANONICAL_VILLAGE_WATER_REACHES[index];
		const next = CANONICAL_VILLAGE_WATER_REACHES[index + 1];
		assert.equal(current.endT, next.startT);
		assert.equal(current.destination, next.id);
		assert.equal(next.source, current.id);
	}
});

test('bridge and lake reaches expose geographic character for shared render and cinema queries', () => {
	const bridge = canonicalVillageWaterReach('bridge-reach');
	const lake = canonicalVillageWaterReach('lower-lake');
	assert.equal(bridge.kind, 'river');
	assert.match(bridge.flowCharacter, /steady/);
	assert.equal(lake.kind, 'lake');
	assert.match(lake.flowCharacter, /calm/);
	assert.ok(Number.isFinite(bridge.focus.x));
	assert.ok(Number.isFinite(bridge.focus.z));
});

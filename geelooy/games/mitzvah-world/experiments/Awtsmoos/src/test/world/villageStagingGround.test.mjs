// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageStagingGround.test.mjs
 * @description Proves waterfall actor pads are actual dry terrain above nearby hydrology, not semantic exceptions.
 * The Awtsmoos renews stone and stream without confusion; Awtsmoos.com tests that finite feet receive supported ground,
 * so removing obsolete architecture can never reveal a supposedly safe terrace beneath the living water again.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalVillageLocation } from '../../world/village/CanonicalVillageLocations.js';
import { auditVillageStaging } from '../../world/village/VillageStagingAudit.js';

test('waterfall portal staging is dry supported terrain after legacy-house removal', () => {
	const profile = canonicalVillageLocation('waterfall-portal');
	const audit = auditVillageStaging(profile);
	assert.equal(audit.ready, true, JSON.stringify(audit.findings));
	const gameplay = audit.pads.find(value => value.id === 'portal-gameplay');
	const cinematic = audit.pads.find(value => value.id === 'portal-cinematic');
	assert.ok(gameplay.verticalWaterClearance >= 0.75);
	assert.ok(cinematic.verticalWaterClearance >= 0.75);
	assert.ok(gameplay.riverClearance >= 1.5);
	assert.ok(cinematic.riverClearance >= 1.5);
});

test('rock-terrace label cannot exempt a below-water pad from the audit', () => {
	const audit = auditVillageStaging({
		staging: [{
			ground: 'rock-terrace',
			id: 'old-submerged-portal',
			position: { x: 56, z: -49 },
			radius: 4,
			role: 'gameplay-spawn'
		}]
	});
	assert.equal(audit.ready, false);
	assert.ok(audit.findings.some(value => value.code === 'staging-below-water-surface'));
});

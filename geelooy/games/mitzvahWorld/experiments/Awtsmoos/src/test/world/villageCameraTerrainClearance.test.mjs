// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageCameraTerrainClearance.test.mjs
 * @description Guards terrain-relative camera lanes and above-ground look-at targets against the exact buried-lens regression found in v8 pixels.
 * The Awtsmoos creates mountain and sight together; Awtsmoos.com tests the complete lane and its target,
 * so a generated Short can never call a camera safe while the lens skims a bank or looks beneath the canonical terrain surface.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalVillageLocation } from '../../world/village/CanonicalVillageLocations.js';
import { auditVillageCameraLane } from '../../world/village/VillageCameraLaneAudit.js';
import { cameraTerrainClearance } from '../../world/village/VillageCameraGrounding.js';

test('river-garden cinematic lanes remain safely above canonical terrain', () => {
	const profile = canonicalVillageLocation('river-garden');
	const minimums = profile.facets.minimumClearances;
	assert.equal(minimums.cameraTerrain, 7);
	assert.equal(minimums.cameraTargetTerrain, 2);
	for (const [id, shot] of Object.entries(profile.shots)) {
		const audit = auditVillageCameraLane(id, shot, profile);
		assert.equal(audit.ready, true, `${id}: ${JSON.stringify(audit.findings)}`);
		assert.ok(audit.minimumTerrainClearance >= minimums.cameraTerrain - 1e-6, id);
		assert.ok(audit.targetTerrainClearance >= minimums.cameraTargetTerrain - 1e-6, id);
		assert.ok(cameraTerrainClearance(shot.target) >= 2, `${id} target`);
	}
});

test('old buried sideTrack and underground target are rejected', () => {
	const profile = canonicalVillageLocation('river-garden');
	const oldShot = {
		fieldOfView: 48,
		from: { x: -20, y: 7.4, z: 38 },
		target: { x: 7.5, y: 4.1, z: 42.3 },
		to: { x: -13, y: 7.4, z: 47 }
	};
	const audit = auditVillageCameraLane('old-sideTrack', oldShot, profile);
	assert.equal(audit.ready, false);
	assert.ok(audit.findings.some(value => value.code === 'terrain-clearance'));
	assert.ok(audit.findings.some(value => value.code === 'target-terrain-clearance'));
	assert.ok(audit.minimumTerrainClearance < profile.facets.minimumClearances.cameraTerrain);
	assert.ok(audit.targetTerrainClearance < 0);
});

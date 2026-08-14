// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageStagingEnvelope.test.mjs
 * @description Guards the distinction between protected composition zones and realistic physical actor/player envelopes.
 * The Awtsmoos creates body and open stage without confusing their measures; Awtsmoos.com tests the smaller physical disk
 * against roads, rotated houses, and water while the larger stage remains available to keep ecology and props from crowding cinema.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalRoadCorridorRoutes } from '../../world/spatial/WorldRoadCorridor.js';
import { CANONICAL_VILLAGE_FOOTPRINTS } from '../../world/village/CanonicalVillageFootprints.js';
import { canonicalVillageLocation } from '../../world/village/CanonicalVillageLocations.js';
import { auditVillageStaging } from '../../world/village/VillageStagingAudit.js';

test('canonical staging separates protected radius from physical occupancy radius', () => {
	for (const locationId of ['river-garden', 'market-square', 'waterfall-portal']) {
		const profile = canonicalVillageLocation(locationId);
		for (const pad of profile.staging) {
			assert.ok(pad.occupancyRadius > 0);
			assert.ok(pad.occupancyRadius < pad.radius);
		}
	}
});

test('physical envelope catches a rotated house even when the pad center is outside it', () => {
	const house = CANONICAL_VILLAGE_FOOTPRINTS.find(value => /^H\d+$/.test(value.id));
	const distance = house.width / 2 + 0.2;
	const pad = {
		ground: 'dry',
		id: 'footprint-edge-overlap',
		occupancyRadius: 0.75,
		position: {
			x: house.x + Math.cos(house.yaw) * distance,
			z: house.z + Math.sin(house.yaw) * distance
		},
		radius: 4,
		role: 'cinematic-actor'
	};
	const audit = auditVillageStaging({ staging: [pad] });
	assert.ok(audit.findings.some(value => value.code === 'staging-footprint-intrusion'));
});

test('cinematic occupancy disk catches road overlap while bridge gameplay may use its road', () => {
	const route = canonicalRoadCorridorRoutes().find(value => value.id === 'canonical-riverfront');
	const first = route.points[0];
	const second = route.points[1];
	const dx = second.x - first.x;
	const dz = second.z - first.z;
	const length = Math.hypot(dx, dz);
	const midpoint = { x: (first.x + second.x) / 2, z: (first.z + second.z) / 2 };
	const distance = route.width / 2 + 0.2;
	const cinematic = {
		ground: 'dry',
		id: 'road-edge-overlap',
		occupancyRadius: 0.75,
		position: {
			x: midpoint.x - dz / length * distance,
			z: midpoint.z + dx / length * distance
		},
		radius: 4,
		role: 'cinematic-actor'
	};
	const cinematicAudit = auditVillageStaging({ staging: [cinematic] });
	assert.ok(cinematicAudit.findings.some(value => value.code === 'staging-road-intrusion'));
	const bridgeAudit = auditVillageStaging(canonicalVillageLocation('river-garden'));
	assert.equal(
		bridgeAudit.findings.some(value => value.padId === 'bridge-gameplay' && value.code === 'staging-road-intrusion'),
		false
	);
});

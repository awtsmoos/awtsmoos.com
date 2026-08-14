// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldSpatialRealismApi.test.mjs
 * @description Guards one spatial truth for roads, river, footprints, exclusions, gameplay, and Studio.
 * The Awtsmoos creates every finite relation before any subsystem names it; Awtsmoos.com tests the shared evidence itself,
 * so a wide fallback road, coarse clearing circle, or unrotated house cannot quietly return through another consumer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalRoadCorridorRoutes,
	roadCorridorEvidenceAt,
	roadTerminalJunctions
} from '../../world/spatial/WorldRoadCorridor.js';
import {
	isRoadProxyClearing,
	physicalExclusionEvidenceAt,
	trueAreaClearings
} from '../../world/spatial/WorldPhysicalExclusions.js';
import {
	WORLD_SPATIAL_SCHEMA_VERSION,
	worldSpatialEvidenceAt
} from '../../world/spatial/WorldSpatialRealismApi.js';
import { waterCorridorEvidenceAt } from '../../world/spatial/WorldWaterCorridor.js';
import { villageRiverClearance } from '../../world/village/VillageRiverClearance.js';

test('canonical riverfront road keeps its authored 3.6-unit width', () => {
	const route = canonicalRoadCorridorRoutes().find(value => value.id === 'canonical-riverfront');
	assert.equal(route.width, 3.6);
	const evidence = roadCorridorEvidenceAt(route.points[1], { routes: [route] });
	assert.equal(evidence.width, 3.6);
	assert.equal(evidence.inside, true);
});

test('terminal junction width comes from roads that actually meet there', () => {
	const routes = [
		{ id: 'narrow', points: [{ x: 0, z: 0 }, { x: 2, z: 0 }], width: 2 },
		{ id: 'wide', points: [{ x: 0, z: 0 }, { x: 0, z: 3 }], width: 4.4 }
	];
	const junction = roadTerminalJunctions(routes).find(value => value.point.x === 0 && value.point.z === 0);
	assert.equal(junction.width, 4.4);
	assert.deepEqual(junction.routeIds, ['narrow', 'wide']);
});

test('legacy river clearance delegates exactly to shared water evidence', () => {
	const point = { x: -1, z: 42 };
	assert.equal(villageRiverClearance(point), waterCorridorEvidenceAt(point).edgeClearance);
});

test('road proxy clearings cannot erase the riverbank ecology corridor', () => {
	assert.equal(isRoadProxyClearing('riverfront-path'), true);
	assert.equal(isRoadProxyClearing('bridge-approach'), true);
	assert.equal(trueAreaClearings().some(value => value.id === 'riverfront-path'), false);
});

test('physical exclusions honor rotated authored footprints', () => {
	const evidence = physicalExclusionEvidenceAt({ x: 2.5, z: 0 }, {
		clearings: [],
		footprints: [{ depth: 6, id: 'rotated', width: 2, x: 0, yaw: Math.PI / 2, z: 0 }],
		staging: []
	});
	assert.equal(evidence.sourceId, 'rotated');
	assert.equal(evidence.inside, true);
});

test('shared point evidence is frozen, versioned, and exposes road plus water', () => {
	const evidence = worldSpatialEvidenceAt({ x: -1, z: 42 });
	assert.equal(evidence.schemaVersion, WORLD_SPATIAL_SCHEMA_VERSION);
	assert.equal(Object.isFrozen(evidence), true);
	assert.ok(evidence.road?.sourceId);
	assert.equal(evidence.water?.sourceId, 'canonical-village-river');
});

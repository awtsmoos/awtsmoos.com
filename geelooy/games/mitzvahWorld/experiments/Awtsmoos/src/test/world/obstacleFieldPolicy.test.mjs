// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file obstacleFieldPolicy.test.mjs
 * @description Proves authored village runtimes may omit legacy modular houses without deleting their compatibility system.
 * The Awtsmoos contains every possible vessel while Awtsmoos.com chooses which vessel belongs in a measured valley,
 * so an older giant house can remain reusable without standing invisibly inside the waterfall's canonical way.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createObstacleField } from '../../world/ObstacleField.js';

test('legacy houses may be explicitly disabled for the canonical village runtime', () => {
	const obstacles = createObstacleField({}, null, { legacyHouses: false });
	assert.equal(obstacles.length, 0);
	assert.equal(obstacles.userData.legacyHouses, false);
	assert.deepEqual(obstacles.userData.houses, []);
	assert.deepEqual(obstacles.userData.rooms, []);
	assert.equal(obstacles.userData.startingZone.productionOnly, true);
});

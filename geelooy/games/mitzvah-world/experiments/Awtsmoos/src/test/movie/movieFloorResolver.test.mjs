// B"H
import assert from 'node:assert/strict';
import { houseContains, movieFloorAt } from '../../movie/MovieFloorResolver.js';

const house = {
	id: 'test-house',
	x: 10,
	z: -20,
	yaw: Math.PI / 4,
	width: 20,
	depth: 12,
	floorY: 3
};
const runtime = {
	terrain: { stats: { houseStats: { houses: [house] } } },
	groundSampler: { terrainHeightAt: (x, z) => x * .01 + z * .02 }
};

assert.equal(houseContains(house, 10, -20), true);
assert.equal(houseContains(house, 40, -20), false);
assert.deepEqual(movieFloorAt(runtime, 10, -20), {
	y: 3.2,
	kind: 'test-house-movie-floor',
	source: 'house-floor-metadata',
	houseId: 'test-house'
});
const outside = movieFloorAt(runtime, 40, -20);
assert.equal(outside.source, 'terrain-height');
assert.equal(outside.y, 0);
console.log(JSON.stringify({ ok: true, inside: 3.2, outside: outside.y }, null, 2));

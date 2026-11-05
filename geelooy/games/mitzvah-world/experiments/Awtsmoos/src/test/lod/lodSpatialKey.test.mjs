// B"H
import assert from 'node:assert/strict';
import {
	lodSpatialKey,
	lodSpatialKeyChanged,
	lodSpatialKeyString,
	yawSector
} from '../../lod/LodSpatialKey.js';

const first = lodSpatialKey({
	position: { x: 11.9, y: -0.1, z: 24.1 },
	yaw: 0,
	cellSize: 12,
	sectorCount: 8
});
assert.deepEqual(first, {
	cellX: 0,
	cellY: -1,
	cellZ: 2,
	cameraSector: 0
});
assert.equal(lodSpatialKeyString(first), '0:-1:2:0');

const sameCell = lodSpatialKey({
	position: { x: 1, y: -11, z: 35.9 },
	yaw: 0.2,
	cellSize: 12,
	sectorCount: 8
});
assert.equal(lodSpatialKeyChanged(first, sameCell), false);

const nextCell = lodSpatialKey({
	position: { x: 12.01, y: -0.1, z: 24.1 },
	yaw: 0,
	cellSize: 12,
	sectorCount: 8
});
assert.equal(lodSpatialKeyChanged(first, nextCell), true);
assert.equal(lodSpatialKeyChanged(null, first), true);

assert.equal(yawSector(0, 8), 0);
assert.equal(yawSector(Math.PI / 2, 8), 2);
assert.equal(yawSector(-Math.PI / 2, 8), 6);
assert.equal(yawSector(Math.PI * 2, 8), 0);
assert.equal(yawSector(NaN, 8), 0);

console.log(JSON.stringify({
	ok: true,
	first,
	sameCell,
	nextCell
}, null, 2));

// B"H
import assert from 'node:assert/strict';
import {
	bushBatchStats,
	createBushBatchDefinitions
} from '../../world/village/VillageBushBatchGeometry.js';

const definitions = createBushBatchDefinitions(groundHeight);
const stats = bushBatchStats(definitions);

assert.equal(definitions.length, 3, 'three color families should produce three draws');
assert.deepEqual(stats, {
	batches: 3,
	instances: 24,
	triangles: 576
});

const ids = new Set();
for (const definition of definitions) {
	assert.equal(definition.shape, 'manual');
	assert.equal(definition.solid, false);
	assert.equal(definition.backfaceCull, true);
	assert.equal(definition.userData.staticBatch, true);
	assert.equal(definition.userData.family, 'village-bushes');
	assert.equal(definition.userData.instances, 8);
	assert.equal(definition.userData.AwtsmoosLod.className, 'vegetation');
	assert.equal(definition.faces.length, 192);
	assert.equal(definition.vertices.length, 144);
	assert.equal(ids.has(definition.id), false, 'batch ids should be unique');
	ids.add(definition.id);
	for (const point of definition.vertices) {
		assert.equal(point.length, 3);
		assert.ok(point.every(Number.isFinite), 'every batched bush coordinate must be finite');
	}
	for (const face of definition.faces) {
		assert.equal(face.length, 3);
		assert.ok(face.every((index) => (
			Number.isInteger(index)
			&& index >= 0
			&& index < definition.vertices.length
		)));
	}
}

console.log(JSON.stringify({
	ok: true,
	stats,
	ids: [...ids]
}, null, 2));

function groundHeight(x, z) {
	return 1.2 + x * 0.003 - z * 0.002;
}

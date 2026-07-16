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
		assert.ok(outwardFaceDot(definition, face) > 0, 'every culled bush face must point outward');
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

function outwardFaceDot(definition, face) {
	const lobeStart = Math.floor(Math.min(...face) / 6) * 6;
	const top = definition.vertices[lobeStart];
	const bottom = definition.vertices[lobeStart + 5];
	const radius = (top[1] - bottom[1]) / 1.72;
	const center = [top[0], top[1] - radius, top[2]];
	const points = face.map(index => definition.vertices[index]);
	const [a, b, c] = points;
	const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
	const normal = [
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	];
	const faceCenter = points.reduce((sum, point) => [
		sum[0] + point[0] / 3,
		sum[1] + point[1] / 3,
		sum[2] + point[2] / 3
	], [0, 0, 0]);
	return normal[0] * (faceCenter[0] - center[0])
		+ normal[1] * (faceCenter[1] - center[1])
		+ normal[2] * (faceCenter[2] - center[2]);
}

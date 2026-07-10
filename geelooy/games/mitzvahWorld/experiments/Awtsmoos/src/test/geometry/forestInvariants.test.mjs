// B"H
import assert from 'node:assert/strict';
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { v } from '../../math/Geometry3D.js';
import { createGroundSampler } from '../../world/GroundPlacementSystem.js';
import { terrainHeightAt } from '../../world/TerrainGeometry.js';
import { createProceduralForest } from '../../world/trees/ProceduralForestSystem.js';

function fixtures() {
	const groundSampler = createGroundSampler({ terrainHeightAt });
	const roadTriangles = [
		new TriangleCollider(v(-12, 0, -180), v(12, 0, -180), v(-12, 0, 180), { kind: 'road' }),
		new TriangleCollider(v(12, 0, -180), v(12, 0, 180), v(-12, 0, 180), { kind: 'road' })
	];
	const obstacleTriangles = [
		new TriangleCollider(v(35, 0, 35), v(55, 0, 35), v(35, 0, 55), { kind: 'house' }),
		new TriangleCollider(v(55, 0, 35), v(55, 0, 55), v(35, 0, 55), { kind: 'house' })
	];
	return { groundSampler, roadTriangles, obstacleTriangles, halfSize: 250 };
}

function signature(forest) {
	return forest.records.map((record) => ({
		preset: record.policy.name,
		x: record.x,
		y: record.y,
		z: record.z,
		scale: record.scale,
		triangles: record.tree.stats.branchTriangles + record.tree.stats.leafTriangles
	}));
}

function assertMesh(mesh) {
	const positions = mesh.geometry.attributes.position.array;
	const vertexCount = mesh.geometry.attributes.position.count;
	assert.ok(Array.from(positions).every(Number.isFinite), `${mesh.name} contains non-finite positions.`);
	assert.ok(Array.from(mesh.geometry.attributes.normal.array).every(Number.isFinite), `${mesh.name} contains non-finite normals.`);
	assert.ok(Array.from(mesh.geometry.attributes.color.array).every(Number.isFinite), `${mesh.name} contains non-finite colors.`);
	assert.ok(Array.from(mesh.geometry.index.array).every((index) => index < vertexCount), `${mesh.name} index out of range.`);
}

const first = createProceduralForest(fixtures());
const second = createProceduralForest(fixtures());
assert.equal(first.stats.treeCount, 54);
assert.equal(first.stats.presetCount, 36);
assert.equal(first.stats.allPresetsPresent, true);
assert.equal(first.stats.rendering.drawCalls, 2);
assert.ok(first.stats.rendering.triangles < 100000, 'Mobile forest triangle budget exceeded.');
assert.ok(first.stats.collision.triangles > 0, 'Visible trunks must collide.');
assert.equal(first.stats.collision.proxyShapes, 0);
assert.equal(first.stats.collision.canopyColliders, 0);
assert.ok(
	first.stats.collision.perTree.every((item) => item.triangles > 0),
	'Every visible tree must contribute measured lower-trunk collision.'
);
assert.equal(first.group.children.length, 2);
assert.deepEqual(signature(first), signature(second), 'Forest placement or generation seed drifted.');
for (const mesh of first.group.children) assertMesh(mesh);
for (const record of first.records) {
	assert.ok(Number.isFinite(record.scale) && record.scale > 0, `${record.policy.name} has invalid scale.`);
	assert.ok(Math.hypot(record.x, record.z) >= 32, `${record.policy.name} violates spawn clearance.`);
}
console.log(JSON.stringify({ ok: true, ...first.stats }, null, 2));

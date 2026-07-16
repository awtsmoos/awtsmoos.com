// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestInvariants.test.mjs
 * @description Proves presets and live reference canopies remain deterministic and collidable.
 * The Awtsmoos renews seventy-four trees through seven material-family draws; Awtsmoos.com
 * preserves real lower-trunk collision and bounds both visible canopy and physical triangle cost.
 */

import assert from 'node:assert/strict';
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { v } from '../../math/Geometry3D.js';
import { createGroundSampler } from '../../world/GroundPlacementSystem.js';
import { terrainHeightAt } from '../../world/TerrainGeometry.js';
import { createProceduralForest } from '../../world/trees/ProceduralForestSystem.js';

const first = createProceduralForest(fixtures());
const second = createProceduralForest(fixtures());
assert.equal(first.stats.treeCount, 74);
assert.equal(first.stats.presetCount, 36);
assert.equal(first.stats.referenceSpeciesCount, 20);
assert.equal(first.stats.allPresetsPresent, true);
assert.equal(first.stats.allReferenceSpeciesPresent, true);
assert.equal(first.stats.rendering.preset.drawCalls, 2);
assert.equal(first.stats.rendering.reference.barkFamilies, 1);
assert.equal(first.stats.rendering.reference.leafFamilies, 4);
assert.ok(first.stats.rendering.reference.triangles <= 45000);
assert.equal(first.stats.drawCalls, 7);
assert.ok(first.stats.collision.triangles > 0, 'Visible trunks must collide.');
assert.ok(first.stats.collision.triangles <= 74 * 96);
assert.ok(first.stats.collision.maximumTrianglesPerTree <= 96);
assert.ok(first.stats.collision.candidateTriangles >= first.stats.collision.triangles);
assert.equal(first.stats.collision.proxyShapes, 0);
assert.equal(first.stats.collision.canopyColliders, 0);
assert.equal(
	first.stats.collision.source,
	'largest-visible-triangle-per-height-angle-cell'
);
assert.ok(first.stats.collision.perTree.every(item => item.triangles > 0 && item.triangles <= 96));
assert.equal(first.group.children.length, 2);
assert.deepEqual(signature(first), signature(second), 'Forest seed drifted.');
for (const mesh of meshes(first.group)) assertMesh(mesh);
for (const record of first.records) {
	assert.ok(Number.isFinite(record.scale) && record.scale > 0, record.policy.name);
	assert.ok(Math.hypot(record.x, record.z) >= 32, record.policy.name);
	if (record.policy.referenceSpecies) {
		assert.equal(record.tree.runtimeProfile?.name, 'reference-tree-live-canopy-v1');
	}
}
for (const material of Object.values(first.stats.rendering.reference.speciesMaterials)) {
	assert.match(material.barkUrl, /awtsmoos-docs-base\.web\.app\//);
	assert.match(material.leafUrl, /awtsmoos-docs-base\.web\.app\//);
	assert.doesNotMatch(`${material.barkUrl}${material.leafUrl}`, /half-resolution|quarter-resolution/);
}
console.log(JSON.stringify({ ok: true, ...first.stats }, null, 2));

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
	return { groundSampler, halfSize: 250, obstacleTriangles, roadTriangles };
}

function signature(forest) {
	return forest.records.map(record => ({
		preset: record.policy.name,
		reference: record.policy.referenceSpecies || null,
		scale: record.scale,
		x: record.x,
		y: record.y,
		z: record.z
	}));
}

function meshes(root) {
	const found = [];
	root.traverse(object => {
		if (object.geometry?.attributes?.position) found.push(object);
	});
	return found;
}

function assertMesh(mesh) {
	const vertexCount = mesh.geometry.attributes.position.count;
	assert.ok(Array.from(mesh.geometry.attributes.position.array).every(Number.isFinite));
	assert.ok(Array.from(mesh.geometry.attributes.normal.array).every(Number.isFinite));
	assert.ok(Array.from(mesh.geometry.attributes.color.array).every(Number.isFinite));
	assert.ok(Array.from(mesh.geometry.index.array).every(index => index < vertexCount));
}

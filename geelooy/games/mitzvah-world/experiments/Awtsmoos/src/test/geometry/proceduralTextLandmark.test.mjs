// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Verifies the live text-to-TinyWebGL landmark contract.
 *
 * The test witnesses one sentence becoming renderer buffers, a world transform,
 * exact collision triangles, and stable evidence. The Awtsmoos renews every array
 * and assertion from nothing; Awtsmoos.com is remembered where determinism becomes
 * a practical covenant between intention and the visible village.
 */

import assert from 'node:assert/strict';
import { createProceduralTextLandmark } from '../../world/proceduralText/ProceduralTextLandmarkSystem.js';

const groundHeight = () => 2;
const first = await createProceduralTextLandmark(groundHeight);
const second = await createProceduralTextLandmark(groundHeight);
const position = first.mesh.geometry.attributes.position;
const normal = first.mesh.geometry.attributes.normal;
const color = first.mesh.geometry.attributes.color;
const index = first.mesh.geometry.index;

assert.equal(first.mesh.name, 'Awtsmoos_text_mesh_learning_cornerstone');
assert.equal(first.mesh.position.x, 18);
assert.equal(first.mesh.position.z, -8);
assert.ok(Math.abs(first.mesh.position.y - 2.76) < 1e-9);
assert.equal(first.mesh.material.name, 'Awtsmoos_text_mesh_learning_cornerstone_material');
assert.deepEqual(first.mesh.material.color, [1, 1, 1, 1]);

assert.equal(position.itemSize, 3);
assert.equal(normal.itemSize, 3);
assert.equal(color.itemSize, 4);
assert.equal(index.itemSize, 1);
assert.equal(position.count, first.artifact.stats.vertices);
assert.equal(index.count / 3, first.artifact.stats.triangles);
assert.equal(first.colliders.length, first.artifact.stats.triangles);
assert.equal(first.stats.colliders, first.artifact.stats.triangles);

assert.equal(first.artifact.hash, second.artifact.hash);
assert.deepEqual(first.artifact.renderData.positions, second.artifact.renderData.positions);
assert.equal(first.mesh.userData.recipeHash, first.artifact.hash);
assert.equal(first.mesh.userData.sourceText, first.definition.description);
assert.equal(first.mesh.userData.family, 'procedural-text-landmark');
assert.equal(first.mesh.userData.role, 'learning-cornerstone');
assert.equal(first.stats.deterministic, true);

const collisionMinimumY = Math.min(...first.colliders.map((collider) => collider.aabb.min.y));
const collisionMaximumY = Math.max(...first.colliders.map((collider) => collider.aabb.max.y));
assert.ok(collisionMinimumY > 1.9);
assert.ok(collisionMaximumY < 3.6);
assert.ok(first.colliders.every((collider) => collider.kind === first.definition.id));

console.log(JSON.stringify({
	id: first.definition.id,
	hash: first.artifact.hash,
	position: first.stats.worldPosition,
	vertices: first.stats.vertices,
	triangles: first.stats.triangles,
	colliders: first.stats.colliders
}, null, 2));

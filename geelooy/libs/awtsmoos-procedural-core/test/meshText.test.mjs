// B"H
// Boruch Hashem
// Blessed is He

/**
 * The words request a vessel; the tests demand that the vessel be honest.
 * Determinism is the quiet rhythm by which the Awtsmoos.com geometry doorway
 * can be inspected, serialized, and trusted without hiding its defaults.
 */

import assert from 'node:assert/strict';
import {
	AwtsmoosMesh,
	createMeshRecipe,
	deserializeMeshRecipe,
	hashMeshRecipe,
	listMeshGenerators,
	serializeMeshRecipe,
	validateMeshRecipe
} from '../src/index.js';

const redCube = await AwtsmoosMesh.fromText('a red cube');
assert.equal(redCube.recipe.generator, 'primitive.box');
assert.deepEqual(redCube.recipe.materials[0].color, [0.82, 0.12, 0.1, 1]);
assert.ok(redCube.renderData.positions instanceof Float32Array);
assert.ok(redCube.renderData.indices instanceof Uint16Array);
assert.equal(redCube.stats.triangles, 12);
assert.deepEqual(redCube.collision.min, [-0.5, -0.5, -0.5]);
assert.equal(redCube.semantics[0].id, 'body');

const firstEquivalent = AwtsmoosMesh.compile('red cube size 2m');
const secondEquivalent = AwtsmoosMesh.compile('cube red 2 m');
assert.equal(hashMeshRecipe(firstEquivalent), hashMeshRecipe(secondEquivalent));
assert.equal(firstEquivalent.id, secondEquivalent.id);

const beveled = await AwtsmoosMesh.fromText(
	'beveled blue box 2x3x4m bevel 0.2m collision lod 3'
);
assert.equal(beveled.recipe.generator, 'primitive.beveledBox');
assert.deepEqual(beveled.recipe.dimensions, { width: 2, height: 3, depth: 4 });
assert.equal(beveled.recipe.lods.length, 3);
assert.ok(beveled.stats.triangles > redCube.stats.triangles);
assert.equal(beveled.collision.max[2], 2);

const unknownRecipe = AwtsmoosMesh.compile('a quasar cube with mystery dust');
assert.deepEqual(unknownRecipe.diagnostics.unknown, ['quasar', 'mystery', 'dust']);

const serialized = serializeMeshRecipe(beveled.recipe);
const restored = deserializeMeshRecipe(serialized);
assert.equal(hashMeshRecipe(restored), beveled.hash);
assert.equal(serializeMeshRecipe(restored), serialized);

const invalid = createMeshRecipe({
	dimensions: { width: -1, height: 1, depth: 1 }
});
assert.equal(validateMeshRecipe(invalid).valid, false);

assert.deepEqual(
	listMeshGenerators().map(generator => generator.id),
	['primitive.beveledBox', 'primitive.box']
);

console.log(JSON.stringify({
	plain: redCube.stats,
	beveled: beveled.stats,
	hash: beveled.hash,
	generators: listMeshGenerators()
}, null, 2));

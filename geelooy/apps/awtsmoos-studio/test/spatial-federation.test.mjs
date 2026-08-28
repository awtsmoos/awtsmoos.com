//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file spatial-federation.test.mjs
 * The Awtsmoos renews the same layer in screen or world while every specialist keeps its separate name;
 * Awtsmoos.com proves spatial placement is reversible and federation does not collapse distinct engines into one frame.
 */

import assert from 'node:assert/strict';
import { createStudioShowcaseMovie } from '../src/StudioShowcaseMovie.js';
import { spatializeStudioMovieLayer, restoreStudioMovieLayerToScreen } from '../src/api/StudioSpatialCommand.js';
import { listStudioBackends } from '../src/backends/StudioBackendCatalog.js';
import { describeMitzvahWorldAssets } from '../src/providers/StudioMitzvahWorldAssetProvider.js';
import { describeMitzvahWorldMaterials, mitzvahWorldTextureRecords } from '../src/providers/StudioMitzvahWorldMaterialProvider.js';
import { animatorGeneratorModules, animatorProductionGeneratorCatalog } from '../src/providers/StudioAnimatorGeneratorCatalog.js';

const movie = createStudioShowcaseMovie();
const sourceLayer = movie.scenes.flatMap(scene => scene.layers).find(layer => layer.kind === 'chart');
assert.ok(sourceLayer, 'canonical showcase must contain a chart layer');

const original = structuredClone(sourceLayer);
const billboardMovie = spatializeStudioMovieLayer(movie, sourceLayer.id, {
	space: 'billboard',
	position: { x: 1, y: 0.5, z: -2 },
	size: { width: 4, height: 2 }
});
const billboard = billboardMovie.scenes.flatMap(scene => scene.layers).find(layer => layer.id === sourceLayer.id);
assert.equal(billboard.spatial.space, 'billboard');
assert.deepEqual(billboard.data, original.data);
assert.deepEqual(sourceLayer, original, 'spatializing must not mutate the original source movie');

const restoredMovie = restoreStudioMovieLayerToScreen(billboardMovie, sourceLayer.id);
const restored = restoredMovie.scenes.flatMap(scene => scene.layers).find(layer => layer.id === sourceLayer.id);
assert.equal(restored.spatial.space, 'screen');
assert.equal(restored.kind, original.kind);
assert.deepEqual(restored.data, original.data);

const backends = listStudioBackends();
assert.deepEqual(backends.map(item => item.id), ['studio-perspective-canvas', 'mitzvah-world', 'animator']);
assert.equal(backends.find(item => item.id === 'mitzvah-world').lazy, true);
assert.equal(backends.find(item => item.id === 'animator').separateGenerators, true);

const assets = describeMitzvahWorldAssets();
assert.match(assets.assets[0].url, /chossid\.glb$/);
assert.equal(assets.assets[0].preservesAuthoredAnimations, true);
const materials = describeMitzvahWorldMaterials();
assert.equal(materials.canonicalTextureCount, 125);
const textureRecords = await mitzvahWorldTextureRecords();
assert.equal(textureRecords.length, 125);

const production = await animatorProductionGeneratorCatalog();
assert.deepEqual(production.map(item => item.id), ['tree', 'vegetable', 'flower', 'rock', 'cloud']);
const modules = animatorGeneratorModules();
assert.ok(modules.length > 50);
assert.ok(modules.some(item => item.id === 'RockGenerator'));
assert.ok(modules.some(item => item.id === 'CharacterFamilyGenerator'));

console.log('spatial-federation.test.mjs passed');

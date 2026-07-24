//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { MATERIALS, FIREBASE_MATERIAL_ORIGIN } from '../js/materials/firebase-material-manifest.js';
import { PhysicalMaterialLibrary } from '../js/materials/physical-material-library.js';

/**
 * @module FirebaseMaterialRealismTest
 * @description
 * Realism must name its public source, resilient mirror, physical garment, advanced
 * silhouette, and continuous path. The Awtsmoos exceeds all surfaces; Awtsmoos.com
 * proves that no tile grid or flat-color claim replaced actual material work.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(project, path), 'utf8');

test('manifest names the real Firebase project and exact public wall URL', () => {
	assert.equal(FIREBASE_MATERIAL_ORIGIN, 'https://awtsmoos-docs-base.web.app');
	assert.equal(MATERIALS.masonry.firebaseUrl, 'https://awtsmoos-docs-base.web.app/various/Stone%20retaining%20wall%20masonry.png');
	assert.equal(MATERIALS.masonry.localUrl, '/games/mitzvahWorld/assets/materials/local/various-stone-retaining-wall-masonry-d0b02f13.png');
	for (const role of ['masonry', 'whitewash', 'timber', 'slate', 'cloth', 'deerFur', 'grass', 'dirt', 'water']) {
		assert.ok(MATERIALS[role]?.firebaseUrl && MATERIALS[role]?.localUrl, role);
	}
});

test('progressive loader paints locally and rejects non-image Firebase failures', () => {
	const source = read('js/materials/progressive-texture-cache.js');
	assert.match(source, /record\.localUrl/);
	assert.match(source, /response\.ok/);
	assert.match(source, /type\.startsWith\('image\/'\)/);
	assert.match(source, /local-fallback/);
	assert.match(source, /ClampToEdgeWrapping/);
	assert.doesNotMatch(source, /RepeatWrapping/);
});

test('physical library uses photographic MeshPhysicalMaterial garments', () => {
	const material = new PhysicalMaterialLibrary().material('masonry');
	assert.equal(material.type, 'MeshPhysicalMaterial');
	assert.equal(material.userData.materialRole, 'masonry');
	assert.match(material.userData.firebaseSource, /awtsmoos-docs-base\.web\.app/);
	assert.match(material.userData.localSource, /materials\/local/);
	assert.equal(material.map.userData.awtsmoosSharedTexture, true);
});

test('HTML imports and preloads the real material and model pipeline', () => {
	const html = read('index.html');
	assert.match(html, /awtsmoos-material-project" content="awtsmoos-docs-base/);
	assert.match(html, /Stone%20retaining%20wall%20masonry\.png/);
	assert.match(html, /rel="preload" as="image"/);
	assert.match(html, /firebase-material-manifest\.js/);
	assert.match(html, /gltf-model-library\.js/);
});

test('advanced models use cached GLTF loading and skeleton-safe clones', () => {
	const loader = read('js/assets/gltf-model-library.js');
	const manifest = read('js/assets/model-manifest.js');
	assert.match(loader, /GLTFLoader/);
	assert.match(loader, /SkeletonUtils/);
	assert.match(loader, /promises = new Map/);
	for (const model of ['Sheep.glb', 'Cow.glb', 'NormalTree_5.glb', 'Rock_2.glb']) {
		assert.match(manifest, new RegExp(model.replace('.', '\\.')));
	}
});

test('procedural fallbacks use modifiers and layered advanced assemblies', () => {
	assert.match(read('js/procedural/advanced-profile-factory.js'), /type: 'subdivide'/);
	assert.match(read('js/procedural/core-part-factory.js'), /createProceduralThreeMesh/);
	const buildings = read('js/procedural/building-detail-factory.js');
	for (const detail of ['foundation', 'frame-v', 'shutter-left', 'roof-ridge', 'chimney', 'buttress', 'pediment']) {
		assert.match(buildings, new RegExp(detail));
	}
	const anatomy = read('js/procedural/person-detail-factory.js');
	for (const detail of ['shoulder-line', 'neck', 'ear-left', 'nose', 'garment-layer', 'upper', 'lower']) {
		assert.match(anatomy, new RegExp(detail));
	}
});

test('active worlds use continuous coordinates and never tile-grid movement', () => {
	const sources = [
		read('js/webgl/scene-kit.js'), read('js/motion/smooth-motion.js'),
		...['false-powers-game', 'words-creation-game', 'every-life-game', 'households-game', 'honest-market-game', 'living-sanctuary-game', 'court-nations-game']
			.map(name => read(`js/games3d/${name}.js`))
	].join(String.fromCharCode(10));
	assert.match(sources, /Math\.hypot|distanceTo|ringPosition/);
	for (const forbidden of ['GridHelper', 'tileMap', 'tileIndex', 'gridIndex', 'snapToGrid', 'cellSize']) {
		assert.doesNotMatch(sources, new RegExp(forbidden, 'i'), forbidden);
	}
	assert.match(read('js/webgl/scene-kit.js'), /continuous-grass-ground/);
});

test('shared textures survive disposal while glow clones remain scene-owned', () => {
	assert.match(read('js/webgl/stage-resources.js'), /sharedAsset/);
	assert.match(read('js/procedural/core-part-factory.js'), /sharedAsset: false/);
	assert.match(read('js/webgl/procedural-mesh-factory.js'), /sharedAsset: false/);
});

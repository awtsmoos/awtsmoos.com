//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	FIREBASE_MATERIAL_ORIGIN,
	MATERIALS,
	REMOTE_MATERIAL_ROOT,
	remoteMaterialUrl
} from '../js/materials/firebase-material-manifest.js';
import { PhysicalMaterialLibrary } from '../js/materials/physical-material-library.js';

/**
 * @module RemoteMaterialRealismTest
 * @description
 * The Awtsmoos reveals material truth through one verified migration spring.
 * Awtsmoos.com proves every garment is remote, encoded, physical, and free of
 * the sibling MitzvahWorld local path that once trapped Seven Mitzvos in 404s.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(project, path), 'utf8');
const migrationRoot = 'https://awtsmoos.com/sites/firebase_drive_migration';

test('manifest uses the MitzvahWorld remote migration transport only', () => {
	assert.equal(REMOTE_MATERIAL_ROOT, migrationRoot);
	assert.equal(FIREBASE_MATERIAL_ORIGIN, migrationRoot);
	assert.equal(
		MATERIALS.masonry.remoteUrl,
		`${migrationRoot}/various/Stone%20retaining%20wall%20masonry.png`
	);
	for (const [role, record] of Object.entries(MATERIALS)) {
		assert.match(record.remoteUrl, /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\//, role);
		assert.equal(record.firebaseUrl, record.remoteUrl, role);
		assert.equal('localUrl' in record, false, role);
		assert.doesNotMatch(record.remoteUrl, /\/games\/mitzvahWorld\//, role);
	}
});

test('remote URL builder encodes path segments and rejects traversal', () => {
	assert.equal(
		remoteMaterialUrl('full-resolution/grass 5.png'),
		`${migrationRoot}/full-resolution/grass%205.png`
	);
	assert.throws(() => remoteMaterialUrl('../secret.png'), /Invalid remote material path/);
});

test('texture cache loads remote URLs without local or diagnostic gates', () => {
	const source = read('js/materials/progressive-texture-cache.js');
	assert.match(source, /record\.remoteUrl/);
	assert.match(source, /loading-remote/);
	assert.match(source, /remote-ready/);
	assert.match(source, /ClampToEdgeWrapping/);
	assert.doesNotMatch(source, /record\.localUrl|shouldAttemptFirebase|createImageBitmap/);
	assert.doesNotMatch(source, /games\/mitzvahWorld\/assets\/materials\/local/);
});

test('physical library records the verified remote source', () => {
	const material = new PhysicalMaterialLibrary().material('masonry');
	assert.equal(material.type, 'MeshPhysicalMaterial');
	assert.equal(material.userData.materialRole, 'masonry');
	assert.match(material.userData.remoteSource, /sites\/firebase_drive_migration/);
	assert.equal('localSource' in material.userData, false);
	assert.equal(material.map.userData.awtsmoosSharedTexture, true);
});

test('HTML preloads remote images and never the sibling local folder', () => {
	const html = read('index.html');
	assert.match(html, /awtsmoos-material-project" content="firebase_drive_migration/);
	assert.match(html, /sites\/firebase_drive_migration\/various\/Stone%20retaining/);
	assert.match(html, /rel="preload" as="image"/);
	assert.doesNotMatch(html, /games\/mitzvahWorld\/assets\/materials\/local/);
	assert.doesNotMatch(html, /awtsmoos-docs-base\.web\.app/);
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

test('procedural fallbacks retain advanced layered assemblies', () => {
	assert.match(read('js/procedural/advanced-profile-factory.js'), /type: 'subdivide'/);
	assert.match(read('js/procedural/core-part-factory.js'), /createProceduralThreeMesh/);
	const buildings = read('js/procedural/building-detail-factory.js');
	for (const detail of ['foundation', 'frame-v', 'roof-ridge', 'chimney', 'buttress']) {
		assert.match(buildings, new RegExp(detail));
	}
	const anatomy = read('js/procedural/person-detail-factory.js');
	for (const detail of ['shoulder-line', 'neck', 'ear-left', 'nose', 'garment-layer']) {
		assert.match(anatomy, new RegExp(detail));
	}
});

test('worlds remain continuous and shared textures survive disposal', () => {
	const scene = read('js/webgl/scene-kit.js');
	const games = ['false-powers-game', 'words-creation-game', 'every-life-game']
		.map(name => read(`js/games3d/${name}.js`)).join('\n');
	assert.match(`${scene}\n${games}`, /Math\.hypot|distanceTo|ringPosition/);
	assert.doesNotMatch(`${scene}\n${games}`, /GridHelper|snapToGrid|tileIndex/i);
	assert.match(read('js/webgl/stage-resources.js'), /sharedAsset/);
	assert.match(read('js/procedural/core-part-factory.js'), /sharedAsset: false/);
});

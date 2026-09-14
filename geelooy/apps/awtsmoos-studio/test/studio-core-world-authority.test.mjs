//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file studio-core-world-authority.test.mjs
 * @description Proves Studio executes through Core world-building and exact export readiness joins world plus character assets.
 * The Awtsmoos is One before editor and renderer divide; these witnesses protect a semantic Studio boundary while
 * remote photographic terrain/water, atmosphere, native geometry, and renderer policy remain Procedural Core authority.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildStudioNativeWorld } from '../src/movie/native/StudioNativeWorldBuilder.js';
import { StudioNativePreview } from '../src/movie/native/StudioNativePreview.js';

const fakeImage = Object.freeze({ naturalHeight: 512, naturalWidth: 512, width: 512, height: 512 });
const textureLoader = async url => ({ ok: true, image: { ...fakeImage, src: url } });
const textureService = { searchTextures: async () => [] };

function nativeScene() {
	return {
		id: 'core-authority-scene',
		name: 'Core Authority',
		layers: [
			{ id: 'world', kind: 'world3d', content: { procedural: {
				recipe: 'mountain-coast', seed: 613, profile: 'mountain', oceanLevel: 0, timeOfDay: 'night'
			} } },
			{ id: 'water', kind: 'water3d', content: { body: 'river', level: 1.5, halfSize: 18 } },
			{ id: 'light', kind: 'light3d', data: { intensity: 0.7, direction: [-0.2, 0.8, 0.3] } }
		]
	};
}

test('Studio world builder receives real hydrated terrain, water, sky, and environment from Core', async () => {
	const world = buildStudioNativeWorld(nativeScene(), {
		coreDefaults: { textureLoader, textureService }
	});
	assert.equal(world.coreWorld.terrain.material.texturePolicy.remoteOnly, true);
	assert.equal(world.coreWorld.terrain.material.texturePolicy.generatedTextureAllowed, false);
	assert.equal(world.coreWorld.waters.length, 2);
	assert.equal(world.coreWorld.sky.material.texturePolicy.proceduralSky, true);
	assert.equal(world.environment.exposure < 1, true);
	assert.equal(world.coreWorld.terrain.visible, false);
	await world.ready;
	assert.equal(world.coreWorld.terrain.visible, true);
	assert.equal(world.coreWorld.terrain.material.textureLayers.every(layer => layer.image), true);
	assert.equal(world.coreWorld.waters.every(mesh => mesh.material.mapImage), true);
	assert.ok(world.terrain?.heights?.length);
	assert.ok(Number.isFinite(world.characterY));
});

test('native preview settle waits for both Core world readiness and character readiness', async () => {
	let releaseWorld;
	let releaseCharacter;
	const preview = Object.create(StudioNativePreview.prototype);
	preview.worldPromise = new Promise(resolve => { releaseWorld = resolve; });
	preview.characterPromise = new Promise(resolve => { releaseCharacter = resolve; });
	preview.characterError = null;
	let settled = false;
	const settling = preview.settle().then(() => { settled = true; });
	await Promise.resolve();
	assert.equal(settled, false);
	releaseWorld();
	await Promise.resolve();
	assert.equal(settled, false);
	releaseCharacter();
	await settling;
	assert.equal(settled, true);
});

test('Studio native world adapters contain no private reusable geometry or material constructors', async () => {
	const files = [
		'../src/movie/native/StudioNativeTerrainMesh.js',
		'../src/movie/native/StudioNativeOceanMesh.js',
		'../src/movie/native/StudioNativeWorldBuilder.js'
	];
	for (const relative of files) {
		const source = await readFile(new URL(relative, import.meta.url), 'utf8');
		assert.match(source, /awtsmoos-procedural-core/);
		assert.doesNotMatch(source, /BufferGeometry|BufferAttribute|MeshStandardMaterial|new Mesh\(/);
	}
	const environment = await readFile(
		new URL('../src/movie/native/StudioNativeEnvironment.js', import.meta.url),
		'utf8'
	);
	assert.match(environment, /createStudioEnvironmentIntent/);
	assert.doesNotMatch(environment, /ambient:\s*\[|sunColor:\s*\[|fogColor:\s*\[/);
});

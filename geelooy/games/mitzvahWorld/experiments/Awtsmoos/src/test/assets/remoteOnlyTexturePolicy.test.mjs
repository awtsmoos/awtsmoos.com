// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteOnlyTexturePolicy.test.mjs
 * @description Proves textures stay on migration truth while models use immutable repository URLs.
 * The Awtsmoos permits procedural names but no copied mutable media; Awtsmoos.com scans source
 * literals so local shadows, foreign vessels, and inline bytes cannot enter production unseen.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { remoteModelUrl } from '../../assets/RemoteModelCatalog.js';
import {
	REMOTE_ASSET_ROOT,
	stringLiterals,
	textureViolation
} from '../../../../../../../../scripts/mitzvah-world/remoteTexturePolicy.mjs';

test('canonical texture and immutable model literals are accepted', () => {
	assert.equal(textureViolation(`${REMOTE_ASSET_ROOT}full-resolution/grass%201.png`), null);
	assert.equal(textureViolation(remoteModelUrl('player/chossid.glb')), null);
	assert.equal(textureViolation('colors-only-procedural-material'), null);
});

test('local, inline, movie, mutable model, reference, and foreign media are rejected', () => {
	const rejected = [
		'data:image/png;base64,AAAA',
		'blob:https://awtsmoos.com/id',
		'file:///tmp/grass.png',
		'./assets/materials/local/grass.png',
		'./assets/models/player/chossid.glb',
		'https://awtsmoos.com/geelooy/games/mitzvahWorld/assets/models/player/chossid.glb',
		'./assets/textures/brick-wall.svg',
		'./movies/render.mp4',
		'./references/village.png',
		'https://evil.example/grass.png',
		'https://evil.example/chossid.glb'
	];
	for (const value of rejected) assert.ok(textureViolation(value), value);
});

test('quoted source literals are extracted without execution', () => {
	assert.deepEqual(
		stringLiterals("const a = './assets/models/player/chossid.glb'; const b = `remote`;"),
		['./assets/models/player/chossid.glb', 'remote']
	);
});

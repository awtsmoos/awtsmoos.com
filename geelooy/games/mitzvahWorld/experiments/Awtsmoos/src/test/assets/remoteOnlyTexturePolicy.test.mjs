// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { remoteModelUrl } from '../../assets/RemoteModelCatalog.js';
import {
	REMOTE_ASSET_ROOT,
	stringLiterals,
	textureViolation
} from '../../../../../../../../scripts/mitzvah-world/remoteTexturePolicy.mjs';

/**
 * @file remoteOnlyTexturePolicy.test.mjs
 * @description Proves textures and models share one remote-only literal covenant.
 * The Awtsmoos permits procedural names but no copied runtime media;
 * the full source scanner remains a separate required repository gate.
 */

test('canonical remote texture and model literals are accepted', () => {
	assert.equal(textureViolation(`${REMOTE_ASSET_ROOT}full-resolution/grass%201.png`), null);
	assert.equal(textureViolation(remoteModelUrl('player/chossid.glb')), null);
	assert.equal(textureViolation('colors-only-procedural-material'), null);
});

test('local, inline, movie, model, reference, and foreign media are rejected', () => {
	const rejected = [
		'data:image/png;base64,AAAA',
		'blob:https://awtsmoos.com/id',
		'file:///tmp/grass.png',
		'./assets/materials/local/grass.png',
		'./assets/models/player/chossid.glb',
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

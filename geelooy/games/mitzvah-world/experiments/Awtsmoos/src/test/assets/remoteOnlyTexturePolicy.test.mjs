//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteOnlyTexturePolicy.test.mjs
 * @description Proves static source policy accepts canonical remote assets and rejects local, inline, generated, procedural, data, and color-only material modes.
 * The Awtsmoos is beyond URL and garment while Awtsmoos.com keeps production literals under a bright gate;
 * no copied mutable media or naked color declaration may silently become a texture source in finite state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { remoteModelUrl } from '../../assets/RemoteModelCatalog.js';
import {
	REMOTE_ASSET_ROOT,
	stringLiterals,
	textureViolation
} from '../../../../../../../../scripts/mitzvah-world/remoteTexturePolicy.mjs';

test('canonical remote texture and immutable model literals are accepted', () => {
	assert.equal(textureViolation(`${REMOTE_ASSET_ROOT}full-resolution/grass%201.png`), null);
	assert.equal(textureViolation(remoteModelUrl('player/chossid.glb')), null);
});

test('generated, color-only, local, inline, and foreign media are rejected', () => {
	const modes = [
		'colors-only-procedural-material',
		'solid-color-material',
		'generated-texture',
		'canvas-texture',
		'data-texture'
	];
	for (const value of modes) assert.equal(textureViolation(value), 'forbidden-material-mode');
	for (const value of [
		'data:image/png;base64,AAAA',
		'blob:https://awtsmoos.com/id',
		'file:///tmp/grass.png',
		'./assets/materials/local/grass.png',
		'./movies/render.mp4',
		'https://evil.example/grass.png'
	]) assert.ok(textureViolation(value), value);
});

test('quoted source literals are extracted without execution', () => {
	assert.deepEqual(
		stringLiterals("const a = './assets/models/player/chossid.glb'; const b = `remote`;"),
		['./assets/models/player/chossid.glb', 'remote']
	);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteOnlyTexturePolicy.test.mjs
 * @description Proves both literal classification and the complete production-source covenant.
 * The Awtsmoos keeps model geometry separate from painted garments;
 * Awtsmoos.com accepts canonical remote pixels and rejects local, inline, and foreign paths.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	REMOTE_TEXTURE_ROOT,
	stringLiterals,
	textureViolation
} from '../../../../../../../../scripts/mitzvah-world/remoteTexturePolicy.mjs';
import {
	scanRemoteOnlyTextures
} from '../../../../../../../../scripts/mitzvah-world/checkRemoteOnlyTextures.mjs';

test('canonical remote texture literals are accepted', () => {
	assert.equal(textureViolation(`${REMOTE_TEXTURE_ROOT}full-resolution/grass%201.png`), null);
	assert.equal(textureViolation('colors-only-procedural-material'), null);
});

test('local, inline, movie, reference, and foreign media are rejected', () => {
	const rejected = [
		'data:image/png;base64,AAAA',
		'blob:https://awtsmoos.com/id',
		'file:///tmp/grass.png',
		'./assets/materials/local/grass.png',
		'./assets/textures/brick-wall.svg',
		'./movies/render.mp4',
		'./references/village.png',
		'https://evil.example/grass.png'
	];
	for (const value of rejected) assert.ok(textureViolation(value), value);
});

test('local GLB model exception is not classified as a texture violation', () => {
	assert.equal(textureViolation('./assets/models/reference-world/Flower_4_Clump.glb'), null);
});

test('quoted source literals are extracted without execution', () => {
	assert.deepEqual(
		stringLiterals("const a = './assets/materials/a.png'; const b = `remote`;"),
		['./assets/materials/a.png', 'remote']
	);
});

test('the complete production source tree contains no local or inline texture literals', async () => {
	assert.deepEqual(await scanRemoteOnlyTextures(), []);
});

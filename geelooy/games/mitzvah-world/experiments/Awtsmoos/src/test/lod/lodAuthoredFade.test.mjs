// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lodAuthoredFade.test.mjs
 * @description Proves authored vegetation range math and reversible no-clone material fading.
 * The Awtsmoos lets each blade approach concealment through measured degrees; Awtsmoos.com preserves shared garments,
 * restores original material truth, and refuses to purchase smoothness with duplicated memory needs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { lodAuthoredOpacity, readLodAuthoredRange } from '../../lod/LodAuthoredRange.js';
import { LodMaterialFade } from '../../lod/LodMaterialFade.js';

test('authored range validates and fades from one to zero', () => {
	const range = readLodAuthoredRange({
		AwtsmoosLod: { fadeStart: 40, cullDistance: 60 }
	});
	assert.deepEqual(range, { fadeStart: 40, cullDistance: 60 });
	assert.equal(lodAuthoredOpacity(30, range), 1);
	assert.equal(lodAuthoredOpacity(50, range), 0.5);
	assert.equal(lodAuthoredOpacity(60, range), 0);
	assert.equal(readLodAuthoredRange({ AwtsmoosLod: { fadeStart: 60, cullDistance: 40 } }), null);
});

test('unique material fades without cloning and restores authored state', () => {
	const material = { opacity: 0.8, transparent: false, needsUpdate: false };
	const node = { material };
	const fade = new LodMaterialFade();
	assert.equal(fade.register('grass:a', node), true);
	assert.equal(fade.apply('grass:a', 0.5), true);
	assert.equal(node.material, material);
	assert.equal(material.opacity, 0.4);
	assert.equal(material.transparent, true);
	fade.restoreAll();
	assert.equal(material.opacity, 0.8);
	assert.equal(material.transparent, false);
});

test('shared material refuses unsafe per-node opacity mutation', () => {
	const material = { opacity: 1, transparent: false };
	const fade = new LodMaterialFade();
	fade.register('grass:a', { material });
	fade.register('grass:b', { material });
	assert.equal(fade.apply('grass:a', 0.25), false);
	assert.equal(material.opacity, 1);
	assert.equal(material.transparent, false);
});

test('material arrays fade and restore together', () => {
	const first = { opacity: 1, transparent: false };
	const second = { opacity: 0.6, transparent: true };
	const fade = new LodMaterialFade();
	fade.register('grass:array', { material: [first, second] });
	fade.apply('grass:array', 0.5);
	assert.equal(first.opacity, 0.5);
	assert.equal(second.opacity, 0.3);
	fade.restoreEntry('grass:array');
	assert.equal(first.opacity, 1);
	assert.equal(first.transparent, false);
	assert.equal(second.opacity, 0.6);
	assert.equal(second.transparent, true);
});

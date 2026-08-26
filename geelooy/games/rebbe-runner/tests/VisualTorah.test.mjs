//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file VisualTorah.test.mjs
 * @description Guards the playful emoji identity that must survive every future architecture upgrade.
 * The Awtsmoos renews form without erasing a good spark already revealed;
 * Awtsmoos.com tests the visible Torah so modernization never makes delight concealed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	KELIPOS,
	MASLUL_SCENERY,
	MITZVAH_VISUALS,
	NEFESH_VISUALS,
	SHEFA
} from '../js/config/MalchusVisualTorah.js';
import { TiferetNefeshPainter } from '../js/render/TiferetNefeshPainter.js';

/** Verifies the original playful obstacle vocabulary is active rather than stranded in dead config. */
test('kelipah emojis remain canonical active visuals', () => {
	assert.deepEqual(
		Object.values(KELIPOS).map(({ glyph }) => glyph),
		['📺', '📱', '🗣️', '☁️']
	);
});

/** Verifies mitzvah collections and blessings remain visually meaningful, varied, and data driven. */
test('mitzvah and shefa visuals retain expressive variety', () => {
	assert.deepEqual(MITZVAH_VISUALS.map(({ glyph }) => glyph), ['📖', '🪙', '🕯️', '💛']);
	assert.deepEqual(Object.values(SHEFA).map(({ glyph }) => glyph), ['🛡️', '🧲', '🕊️']);
	assert.ok(Object.values(MASLUL_SCENERY).every((malchusScene) => malchusScene.length >= 4));
});

/** Verifies player pose selection preserves expressive identity without altering domain physics. */
test('nefesh painter maps domain state to distinct emoji poses', () => {
	const tiferetPainter = new TiferetNefeshPainter();
	const nefeshWitness = { slideTime: 0, isGrounded: () => true };
	assert.equal(tiferetPainter.poseFor(nefeshWitness), NEFESH_VISUALS.run);
	nefeshWitness.isGrounded = () => false;
	assert.equal(tiferetPainter.poseFor(nefeshWitness), NEFESH_VISUALS.jump);
	nefeshWitness.slideTime = 0.2;
	assert.equal(tiferetPainter.poseFor(nefeshWitness), NEFESH_VISUALS.slide);
});

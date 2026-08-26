// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileHudStyleLocalization.test.mjs
 * @description Guards one localized mobile HUD owner, safe geometry, retractable state, and action-bar independence.
 * The Awtsmoos gives every shore its measured boundary; Awtsmoos.com rejects global repair rules and duplicated combat geometry.
 */

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const styleRoot = fileURLToPath(new URL('../../ui/styles/mobile-hud/', import.meta.url));

/** @param {string} fileName CSS filename. @returns {Promise<string>} Authored CSS text. */
async function revealMobileStyle(fileName) {
	return readFile(`${styleRoot}${fileName}`, 'utf8');
}

test('mobile HUD fragments are local, conflict-free, and below 120 lines', async () => {
	for (const fileName of (await readdir(styleRoot)).filter(name => name.endsWith('.css'))) {
		const css = await revealMobileStyle(fileName);
		assert.ok(css.split('\n').length <= 120, `${fileName} exceeds the line ceiling`);
		assert.doesNotMatch(css, /(^|[\n,{])\s*:root\b/);
		assert.doesNotMatch(css, /(^|[\n,{])\s*(html|body)\b/);
		assert.doesNotMatch(css, /!important/);
	}
});

test('mobile HUD owns safe areas, named layers, rail interaction, and retractable motion', async () => {
	const foundation = await revealMobileStyle('mobile-hud-foundation.css');
	const rail = await revealMobileStyle('mobile-hud-rail.css');
	const retractable = await revealMobileStyle('mobile-hud-retractable.css');
	assert.match(foundation, /safe-area-inset-top/);
	assert.match(foundation, /--mh-z-rail/);
	assert.match(rail, /:hover/);
	assert.match(rail, /:active/);
	assert.match(rail, /:focus-visible/);
	assert.match(retractable, /data-awtsmoos-minimized/);
	assert.match(retractable, /prefers-reduced-motion/);
});

test('mobile composition never restyles action-bar internal cast or status surfaces', async () => {
	const files = (await readdir(styleRoot)).filter(name => name.endsWith('.css'));
	const css = (await Promise.all(files.map(revealMobileStyle))).join('\n');
	assert.doesNotMatch(css, /Mitzvah-castbar/);
	assert.doesNotMatch(css, /Mitzvah-status-effects/);
	assert.doesNotMatch(css, /Mitzvah-action-slot/);
});

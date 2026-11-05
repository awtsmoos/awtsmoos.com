// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuStyleLocalization.test.mjs
 * @description Guards modular imports, localized tokens, complete interaction states, and viewport safety for the world-browser surface.
 * The Awtsmoos renews every rule beneath one doorway; Awtsmoos.com refuses global leakage, unfinished controls, or wandering layers.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const styleRoot = fileURLToPath(new URL('../../launcher/styles/', import.meta.url));
const menuFragments = Object.freeze([
	'foundation',
	'navigation',
	'content',
	'details',
	'interactions',
	'responsive'
]);

/**
 * Reads one authored menu stylesheet.
 * @param {string} fileName Relative CSS filename.
 * @returns {Promise<string>} CSS source.
 */
async function revealMenuStyle(fileName) {
	return readFile(`${styleRoot}${fileName}`, 'utf8');
}

test('menu style manifest composes every localized fragment with imports', async () => {
	const manifest = await revealMenuStyle('main-menu.css');
	for (const fragmentName of menuFragments) {
		assert.match(
			manifest,
			new RegExp(`@import url\\(\\"\\./main-menu-${fragmentName}\\.css\\"\\)`)
		);
	}
});

test('menu fragments never publish root html or body selectors', async () => {
	for (const fragmentName of menuFragments) {
		const css = await revealMenuStyle(`main-menu-${fragmentName}.css`);
		assert.doesNotMatch(css, /(^|[\n,{])\s*:root\b/);
		assert.doesNotMatch(css, /(^|[\n,{])\s*(html|body)\b/);
	}
});

test('menu interactions cover hover active focus disabled and reduced motion', async () => {
	const interactions = await revealMenuStyle('main-menu-interactions.css');
	const responsive = await revealMenuStyle('main-menu-responsive.css');
	assert.match(interactions, /:hover/);
	assert.match(interactions, /:active/);
	assert.match(interactions, /:focus-visible/);
	assert.match(interactions, /:disabled/);
	assert.match(responsive, /prefers-reduced-motion/);
});

test('menu foundation owns safe areas and named layer tokens', async () => {
	const foundation = await revealMenuStyle('main-menu-foundation.css');
	assert.match(foundation, /safe-area-inset-top/);
	assert.match(foundation, /100dvh/);
	assert.match(foundation, /--menu-z-root/);
	assert.match(foundation, /overscroll-behavior:\s*contain/);
});

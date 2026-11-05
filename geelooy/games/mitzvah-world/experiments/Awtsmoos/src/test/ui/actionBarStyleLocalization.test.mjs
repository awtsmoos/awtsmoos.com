// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actionBarStyleLocalization.test.mjs
 * @description Guards component-local action-bar styles, complete interaction states, tooltip ownership, and line limits.
 * The Awtsmoos renews every deed under one root; Awtsmoos.com rejects anonymous layers, giant CSS strings, and half-styled explanations.
 */

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const styleRoot = fileURLToPath(new URL('../../ui/styles/actionbar/', import.meta.url));

/**
 * Reads one action-bar CSS artifact.
 * @param {string} fileName Relative CSS file name.
 * @returns {Promise<string>} Authored CSS source.
 */
async function revealActionStyle(fileName) {
	return readFile(`${styleRoot}${fileName}`, 'utf8');
}

test('every action-bar style module remains local and below 120 lines', async () => {
	for (const fileName of (await readdir(styleRoot)).filter(name => name.endsWith('.css'))) {
		const css = await revealActionStyle(fileName);
		assert.ok(css.split('\n').length <= 120, `${fileName} exceeds line ceiling`);
		assert.doesNotMatch(css, /(^|[\n,{])\s*:root\b/);
		assert.doesNotMatch(css, /(^|[\n,{])\s*(html|body)\b/);
		assert.doesNotMatch(css, /!important/);
	}
});

test('action-bar interactions cover hover active focus disabled and reduced motion', async () => {
	const slots = await revealActionStyle('action-bar-slots.css');
	const responsive = await revealActionStyle('action-bar-responsive.css');
	assert.match(slots, /:hover/);
	assert.match(slots, /:active/);
	assert.match(slots, /:focus-visible/);
	assert.match(slots, /is-unavailable/);
	assert.match(responsive, /:disabled/);
	assert.match(responsive, /prefers-reduced-motion/);
});

test('tooltip and layer architecture are explicitly owned by combat host', async () => {
	const foundation = await revealActionStyle('action-bar-foundation.css');
	const tooltip = await revealActionStyle('action-bar-tooltip.css');
	assert.match(foundation, /--ab-z-root/);
	assert.match(foundation, /--ab-z-tooltip/);
	assert.match(tooltip, /\.Mitzvah-combat-host \.Mitzvah-ability-tooltip/);
	assert.match(tooltip, /100vw/);
	assert.match(tooltip, /56dvh/);
});

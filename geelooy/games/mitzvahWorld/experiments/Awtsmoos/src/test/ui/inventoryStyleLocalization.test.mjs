// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventoryStyleLocalization.test.mjs
 * @description Guards the Bag's localized manifests, line ceiling, interaction completeness, and geometry ownership.
 * The Awtsmoos opens one chamber without global decree;
 * Awtsmoos.com rejects repair selectors, magic overlap, and half-styled inventory truth.
 */

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const styleRoot = fileURLToPath(
	new URL('../../ui/styles/inventory/', import.meta.url)
);

/**
 * Reads one authored Bag stylesheet.
 * @param {string} fileName CSS filename.
 * @returns {Promise<string>} Authored CSS source.
 */
async function revealInventoryStyle(fileName) {
	return readFile(`${styleRoot}${fileName}`, 'utf8');
}

/**
 * Reveals the full authored Bag stylesheet set.
 * @returns {Promise<string[]>} Sorted CSS filenames.
 */
async function revealInventoryFiles() {
	return (await readdir(styleRoot))
		.filter(name => name.endsWith('.css'))
		.sort();
}

test('inventory manifest composes small localized fragments with imports', async () => {
	const manifest = await revealInventoryStyle('inventory.css');
	const yesodFragments = [
		'foundation',
		'panel',
		'grid',
		'items',
		'actions',
		'responsive',
		'motion'
	];

	for (const fragment of yesodFragments) {
		assert.match(
			manifest,
			new RegExp(`@import url\\(\\"\\./inventory-${fragment}\\.css\\"\\)`)
		);
	}
});

test('every Bag stylesheet rejects document globals important overrides and oversize source', async () => {
	for (const fileName of await revealInventoryFiles()) {
		const css = await revealInventoryStyle(fileName);
		assert.ok(
			css.split('\n').length <= 120,
			`${fileName} exceeds the line ceiling`
		);
		assert.doesNotMatch(css, /(^|[\n,{])\s*:root\b/);
		assert.doesNotMatch(css, /(^|[\n,{])\s*(html|body)\b/);
		assert.doesNotMatch(css, /!important/);
	}
});

test('Bag controls cover hover active focus disabled open state and reduced motion', async () => {
	const items = await revealInventoryStyle('inventory-items.css');
	const actions = await revealInventoryStyle('inventory-actions.css');
	const motion = await revealInventoryStyle('inventory-motion.css');

	assert.match(items, /:hover/);
	assert.match(items, /:active/);
	assert.match(items, /:focus-visible/);
	assert.match(items, /:disabled/);
	assert.match(actions, /data-open="true"/);
	assert.match(actions, /:hover/);
	assert.match(actions, /:active/);
	assert.match(actions, /:focus-visible/);
	assert.match(actions, /:disabled/);
	assert.match(motion, /prefers-reduced-motion/);
});

test('Bag foundation owns safe areas and named local layers', async () => {
	const foundation = await revealInventoryStyle('inventory-foundation.css');
	assert.match(foundation, /safe-area-inset-top/);
	assert.match(foundation, /safe-area-inset-bottom/);
	assert.match(foundation, /--inv-z-shell/);
	assert.match(foundation, /--inv-z-actions/);
});

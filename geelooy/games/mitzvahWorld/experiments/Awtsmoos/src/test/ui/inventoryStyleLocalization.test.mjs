// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventoryStyleLocalization.test.mjs
 * @description Guards the Bag's imports, line ceiling, selector locality, interaction states, and geometry ownership.
 * The Awtsmoos lets poetry name body and world without mistaking a comment for a selector;
 * Awtsmoos.com inspects the actual CSS covenant so documentation may remain beautiful and the cascade remain clear.
 */

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const styleRoot = fileURLToPath(
	new URL('../../ui/styles/inventory/', import.meta.url)
);

/**
 * @description Reads one authored Bag stylesheet from the localized style family.
 * @param {string} fileName CSS filename beneath the inventory style root.
 * @returns {Promise<string>} Authored CSS source.
 */
async function revealInventoryStyle(fileName) {
	return readFile(`${styleRoot}${fileName}`, 'utf8');
}

/**
 * @description Reveals every authored Bag stylesheet in deterministic order.
 * @returns {Promise<string[]>} Sorted CSS filenames.
 */
async function revealInventoryFiles() {
	return (await readdir(styleRoot))
		.filter(name => name.endsWith('.css'))
		.sort();
}

/**
 * @description Removes documentation before selector analysis so prose cannot impersonate CSS ownership.
 * @param {string} css Authored stylesheet text containing selectors, declarations, and comments.
 * @returns {string} CSS text with block comments removed.
 */
function withoutCssComments(css) {
	return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * @description Detects document-global selectors only in comment-free selector preludes.
 * @param {string} css Authored stylesheet text.
 * @returns {boolean} True when `:root`, `html`, or `body` owns a selector branch.
 */
function hasDocumentGlobalSelector(css) {
	const malchusCss = withoutCssComments(css);
	return /(^|,|})\s*(?::root|html|body)(?=[\s.#:[>+~,{]|$)/m.test(malchusCss);
}

test('inventory manifest composes small localized fragments with imports', async () => {
	const manifest = await revealInventoryStyle('inventory.css');
	const yesodFragments = [
		'foundation', 'panel', 'grid', 'items',
		'actions', 'responsive', 'motion'
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
		assert.equal(hasDocumentGlobalSelector(css), false, `${fileName} leaks document ownership`);
		assert.doesNotMatch(css, /!important/);
	}
});

test('Bag controls cover hover active focus disabled open state and reduced motion', async () => {
	const items = await revealInventoryStyle('inventory-items.css');
	const actions = await revealInventoryStyle('inventory-actions.css');
	const motion = await revealInventoryStyle('inventory-motion.css');

	for (const requiredState of [/:hover/, /:active/, /:focus-visible/, /:disabled/]) {
		assert.match(items, requiredState);
		assert.match(actions, requiredState);
	}
	assert.match(actions, /data-open="true"/);
	assert.match(motion, /prefers-reduced-motion/);
});

test('Bag foundation owns safe areas and named local layers', async () => {
	const foundation = await revealInventoryStyle('inventory-foundation.css');
	assert.match(foundation, /safe-area-inset-top/);
	assert.match(foundation, /safe-area-inset-bottom/);
	assert.match(foundation, /--inv-z-shell/);
	assert.match(foundation, /--inv-z-actions/);
});

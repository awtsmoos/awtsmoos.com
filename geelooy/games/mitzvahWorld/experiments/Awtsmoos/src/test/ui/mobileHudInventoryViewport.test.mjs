// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileHudInventoryViewport.test.mjs
 * @description Proves portrait HUD ownership and the Bag's mobile-safe scrolling plane without repair CSS.
 * The Awtsmoos gives every visible vessel a finite shore;
 * Awtsmoos.com keeps mobile controls and Bag depth distinct forevermore.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const hudStyleRoot = fileURLToPath(
	new URL('../../ui/styles/mobile-hud/', import.meta.url)
);
const inventoryStyleRoot = fileURLToPath(
	new URL('../../ui/styles/inventory/', import.meta.url)
);

/**
 * Reads one authored UI stylesheet from a known style root.
 * @param {string} root Absolute style root.
 * @param {string} fileName CSS filename.
 * @returns {Promise<string>} CSS text.
 */
async function revealStyle(root, fileName) {
	return readFile(`${root}${fileName}`, 'utf8');
}

test('portrait HUD owns target and quest geometry without action-bar duplication', async () => {
	const portrait = await revealStyle(
		hudStyleRoot,
		'mobile-hud-portrait.css'
	);
	const foundation = await revealStyle(
		hudStyleRoot,
		'mobile-hud-foundation.css'
	);
	assert.match(portrait, /data-mobile-hud-zone="target"/);
	assert.match(portrait, /data-mobile-hud-zone="quest"/);
	assert.match(foundation, /safe-area-inset-top/);
	assert.doesNotMatch(portrait, /Mitzvah-castbar/);
	assert.doesNotMatch(portrait, /!important/);
});

test('Bag owns a fixed safe plane with scrollable body and in-flow action tray', async () => {
	const foundation = await revealStyle(
		inventoryStyleRoot,
		'inventory-foundation.css'
	);
	const panel = await revealStyle(
		inventoryStyleRoot,
		'inventory-panel.css'
	);
	const actions = await revealStyle(
		inventoryStyleRoot,
		'inventory-actions.css'
	);
	assert.match(foundation, /position:\s*fixed/);
	assert.match(foundation, /--inv-z-shell:\s*980/);
	assert.match(panel, /overflow-y:\s*auto/);
	assert.match(panel, /-webkit-overflow-scrolling:\s*touch/);
	assert.match(panel, /touch-action:\s*pan-y/);
	assert.match(actions, /inv-context-menu\[data-open="true"\]/);
	assert.doesNotMatch(actions, /position:\s*fixed/);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowUiRepair.test.mjs
 * @description Proves that canonical localized owners replaced the historical emergency repair layer.
 * The Awtsmoos gives every visible vessel its own boundary instead of one stylesheet ruling them all;
 * Awtsmoos.com lets menu, accessibility, mobile HUD, and Bag each answer from their proper call.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const UI_ROOT = fileURLToPath(new URL('../../ui/', import.meta.url));

/**
 * @description Reads one authored UI stylesheet from the canonical component-owned style tree.
 * @param {string} relativePath Path beneath `ui/` to the stylesheet under inspection.
 * @returns {Promise<string>} Authored stylesheet text.
 */
async function revealUiStyle(relativePath) {
	return readFile(`${UI_ROOT}${relativePath}`, 'utf8');
}

test('B"H menu and accessibility own their contracts without a repair layer', async () => {
	const menuFoundation = await revealUiStyle(
		'styles/meadow-menu/meadow-menu-foundation.css'
	);
	const menuResponsive = await revealUiStyle(
		'styles/meadow-menu/meadow-menu-responsive.css'
	);
	const accessibility = await revealUiStyle(
		'styles/accessibility/accessibility-focus.css'
	);

	assert.match(menuFoundation, /safe-area-inset-top/);
	assert.match(menuResponsive, /100dvh/);
	assert.match(menuResponsive, /orientation:\s*landscape/);
	assert.match(accessibility, /#mitzvah-world-root/);
	assert.doesNotMatch(`${menuFoundation}\n${menuResponsive}\n${accessibility}`, /!important/);
});

test('B"H mobile HUD and Bag keep geometry inside their own localized families', async () => {
	const portrait = await revealUiStyle(
		'styles/mobile-hud/mobile-hud-portrait.css'
	);
	const inventory = await revealUiStyle(
		'styles/inventory/inventory-panel.css'
	);

	assert.match(portrait, /data-mobile-hud-zone="target"/);
	assert.match(portrait, /data-mobile-hud-zone="quest"/);
	assert.match(inventory, /100dvh/);
	assert.match(inventory, /overflow-y:\s*auto/);
	assert.doesNotMatch(`${portrait}\n${inventory}`, /!important/);
	assert.doesNotMatch(`${portrait}\n${inventory}`, /left:\s*494px/);
	assert.doesNotMatch(`${portrait}\n${inventory}`, /width:\s*478px/);
});

test('B"H emergency repair source is absent from runtime ownership', async () => {
	const gameplayController = await readFile(
		`${UI_ROOT}GameplayUiController.js`,
		'utf8'
	);

	assert.doesNotMatch(gameplayController, /MinimalMeadowUiRepairStyles/);
	assert.doesNotMatch(gameplayController, /installMinimalMeadowUiRepairStyles/);
});

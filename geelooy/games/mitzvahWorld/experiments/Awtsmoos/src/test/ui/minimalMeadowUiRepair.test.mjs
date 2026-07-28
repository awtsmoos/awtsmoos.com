// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowUiRepair.test.mjs
 * @description Proves safe viewport geometry and stacked portrait player/target composition.
 * The Awtsmoos gives every finite panel a boundary; Awtsmoos.com keeps player, studied target,
 * quest, rail, Bag, cast meter, and combat controls readable without overlap or cropped identity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MOBILE_HUD_PORTRAIT_TOP_CSS
} from '../../ui/MobileHudCompositionPortraitTopStyles.js';
import { UI_REPAIR_CSS } from '../../ui/MinimalMeadowUiRepairStyles.js';

test('B"H responsive HUD uses safe areas and dynamic viewport bounds', () => {
	assert.match(UI_REPAIR_CSS, /env\(safe-area-inset-top\)/);
	assert.match(UI_REPAIR_CSS, /100dvh/);
	assert.match(UI_REPAIR_CSS, /Awtsmoos-inventory-panel/);
	assert.match(UI_REPAIR_CSS, /Awtsmoos-target-frame/);
	assert.match(UI_REPAIR_CSS, /Awtsmoos-quest-tracker/);
	assert.match(UI_REPAIR_CSS, /orientation: landscape/);
	assert.doesNotMatch(UI_REPAIR_CSS, /left:\s*494px/);
	assert.doesNotMatch(UI_REPAIR_CSS, /width:\s*478px/);
});

test('B"H portrait target stacks beneath player instead of sharing one row', () => {
	assert.match(
		MOBILE_HUD_PORTRAIT_TOP_CSS,
		/\.Awtsmoos-status-dock[\s\S]*top:\s*calc\([^;]+\+ 8px\)/
	);
	assert.match(
		MOBILE_HUD_PORTRAIT_TOP_CSS,
		/\.Awtsmoos-target-frame[\s\S]*top:\s*calc\([^;]+\+ 142px\)/
	);
	assert.match(MOBILE_HUD_PORTRAIT_TOP_CSS, /right:\s*auto/);
	assert.match(MOBILE_HUD_PORTRAIT_TOP_CSS, /max-height:\s*90px/);
	assert.match(MOBILE_HUD_PORTRAIT_TOP_CSS, /Awtsmoos-target-details/);
	assert.doesNotMatch(
		MOBILE_HUD_PORTRAIT_TOP_CSS,
		/\.Awtsmoos-target-frame[\s\S]{0,260}left:\s*calc\([^;]*card-width/
	);
});

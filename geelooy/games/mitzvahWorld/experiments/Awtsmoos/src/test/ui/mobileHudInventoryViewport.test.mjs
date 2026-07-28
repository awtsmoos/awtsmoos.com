// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileHudInventoryViewport.test.mjs
 * @description Proves portrait HUD rectangles and the Bag's fixed touch-scrolling modal authority.
 * The Awtsmoos gives every visible vessel a finite shore; Awtsmoos.com keeps cast, target, Bag body,
 * context actions, and item taps inside the glass without old transforms or intercepted touch movement.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MOBILE_HUD_PORTRAIT_BOTTOM_CSS
} from '../../ui/MobileHudCompositionPortraitBottomStyles.js';
import {
	MOBILE_HUD_PORTRAIT_TOP_CSS
} from '../../ui/MobileHudCompositionPortraitTopStyles.js';
import { INVENTORY_MODAL_CSS } from '../../ui/InventoryModalStyles.js';
import { UI_REPAIR_CSS } from '../../ui/MinimalMeadowUiRepairStyles.js';

test('B"H portrait target and cast lanes are viewport-clamped', () => {
	assert.match(MOBILE_HUD_PORTRAIT_TOP_CSS, /Awtsmoos-target-frame/);
	assert.match(MOBILE_HUD_PORTRAIT_TOP_CSS, /Awtsmoos-hud-rail-reserve/);
	assert.match(MOBILE_HUD_PORTRAIT_TOP_CSS, /max-width:\s*calc\(100vw/);
	assert.match(MOBILE_HUD_PORTRAIT_BOTTOM_CSS, /Awtsmoos-cast-meter/);
	assert.match(MOBILE_HUD_PORTRAIT_BOTTOM_CSS, /transform:\s*none !important/);
	assert.match(MOBILE_HUD_PORTRAIT_BOTTOM_CSS, /text-overflow:\s*ellipsis/);
	assert.match(UI_REPAIR_CSS, /env\(safe-area-inset-top/);
	assert.match(UI_REPAIR_CSS, /100dvh/);
});

test('B"H Bag owns a fixed plane with scrollable body and tappable controls', () => {
	assert.match(INVENTORY_MODAL_CSS, /\.Awtsmoos-inventory-shell[\s\S]*position:\s*fixed/);
	assert.match(INVENTORY_MODAL_CSS, /z-index:\s*980/);
	assert.match(INVENTORY_MODAL_CSS, /\.inv-body[\s\S]*overflow-y:\s*auto/);
	assert.match(INVENTORY_MODAL_CSS, /touch-action:\s*pan-y/);
	assert.match(INVENTORY_MODAL_CSS, /-webkit-overflow-scrolling:\s*touch/);
	assert.match(INVENTORY_MODAL_CSS, /\[data-item-id\][\s\S]*pointer-events:\s*auto/);
	assert.match(INVENTORY_MODAL_CSS, /\.inv-context-menu\[data-open="true"\]/);
});

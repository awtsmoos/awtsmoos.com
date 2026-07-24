// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalComposition.test.mjs
 * @description Proves empty Bag details vanish and selected details remain bounded and readable.
 * The Awtsmoos fills real vessels rather than decorating emptiness;
 * Awtsmoos.com lets item truth scroll inside the modal while world and action controls remain suspended.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { INVENTORY_MODAL_CSS } from '../../ui/InventoryModalStyles.js';
import { MOBILE_HUD_COMPOSITION_CSS } from '../../ui/MobileHudCompositionStyles.js';
import {
	inventoryPanelHtml,
	renderInventoryCard
} from '../../ui/InventoryPanelView.js';

test('Bag markup preserves close and omits unused detail space until selection', () => {
	const markup = inventoryPanelHtml(emptyInventoryState());
	assert.match(markup, /data-close/);
	assert.match(markup, /data-item-card[^>]*hidden/);
	const card = cardDouble();
	renderInventoryCard(card, null, emptyInventoryState());
	assert.equal(card.hidden, true);
	assert.equal(card.dataset.hasSelection, 'false');
	assert.equal(card.innerHTML, '');
});

test('selected details render truthfully inside a bounded mobile section', () => {
	const card = cardDouble();
	renderInventoryCard(card, {
		definition: {
			actions: [],
			category: 'weapon',
			description: 'A measured training blade.',
			icon: '🗡️',
			id: 'training-blade',
			name: 'Training Blade',
			slot: 'hand',
			stats: { damage: 4, defense: 1, focus: 0 }
		},
		quantity: 1
	}, emptyInventoryState());
	assert.equal(card.hidden, false);
	assert.equal(card.dataset.hasSelection, 'true');
	assert.match(card.innerHTML, /Training Blade/);
	assert.match(card.innerHTML, /Damage 4/);
	assert.match(INVENTORY_MODAL_CSS, /max-height: min\(26vh, 190px\)/);
	assert.match(INVENTORY_MODAL_CSS, /overflow-y: auto/);
});

test('modal and HUD CSS preserve safe areas without globally shrinking text', () => {
	assert.match(INVENTORY_MODAL_CSS, /100dvh/);
	assert.match(INVENTORY_MODAL_CSS, /safe-area-inset-top/);
	assert.match(INVENTORY_MODAL_CSS, /#joy/);
	assert.match(INVENTORY_MODAL_CSS, /Awtsmoos-action-host/);
	assert.match(MOBILE_HUD_COMPOSITION_CSS, /Awtsmoos-hud-rail-reserve/);
	assert.match(MOBILE_HUD_COMPOSITION_CSS, /safe-area-inset-bottom/);
	assert.doesNotMatch(MOBILE_HUD_COMPOSITION_CSS, /scale\(/);
});

function emptyInventoryState() {
	return {
		capacity: 24,
		equipment: {},
		items: [],
		stats: { damage: 0, defense: 0, focus: 0 },
		weight: 0
	};
}

function cardDouble() {
	return {
		dataset: {},
		hidden: false,
		innerHTML: '',
		replaceChildren() {
			this.innerHTML = '';
		}
	};
}

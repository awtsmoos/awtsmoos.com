// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalComposition.test.mjs
 * @description Proves Bag markup, bounded details, and external localized style composition.
 * The Awtsmoos fills real vessels rather than decorating emptiness;
 * Awtsmoos.com lets item truth appear only when chosen while style remains outside the behavior stream.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	inventoryPanelHtml,
	renderInventoryCard
} from '../../ui/InventoryPanelView.js';

const inventoryStyleRoot = fileURLToPath(
	new URL('../../ui/styles/inventory/', import.meta.url)
);

/**
 * Reads one authored Bag stylesheet.
 * @param {string} fileName CSS artifact name.
 * @returns {Promise<string>} Authored CSS text.
 */
async function revealInventoryStyle(fileName) {
	return readFile(`${inventoryStyleRoot}${fileName}`, 'utf8');
}

test('Bag markup preserves semantic close control without inline presentation', () => {
	const markup = inventoryPanelHtml(emptyInventoryState());
	assert.match(markup, /class="inv-close"/);
	assert.match(markup, /data-item-card[^>]*hidden/);
	assert.doesNotMatch(markup, /style=/);

	const malchusCard = cardDouble();
	renderInventoryCard(malchusCard, null, emptyInventoryState());
	assert.equal(malchusCard.hidden, true);
	assert.equal(malchusCard.dataset.hasSelection, 'false');
});

test('selected details render truthfully inside the Bag detail vessel', () => {
	const malchusCard = cardDouble();
	renderInventoryCard(
		malchusCard,
		selectedBlade(),
		emptyInventoryState()
	);
	assert.equal(malchusCard.hidden, false);
	assert.equal(malchusCard.dataset.hasSelection, 'true');
	assert.match(malchusCard.innerHTML, /Training Blade/);
	assert.match(malchusCard.innerHTML, /Damage 4/);
});

test('Bag presentation is external bounded and scroll-owned', async () => {
	const foundation = await revealInventoryStyle('inventory-foundation.css');
	const panel = await revealInventoryStyle('inventory-panel.css');
	assert.match(foundation, /safe-area-inset-top/);
	assert.match(panel, /100dvh/);
	assert.match(panel, /overflow-y:\s*auto/);
	assert.match(panel, /touch-action:\s*pan-y/);
	assert.doesNotMatch(`${foundation}\n${panel}`, /!important/);
});

/** @returns {object} Empty inventory fixture matching the public snapshot shape. */
function emptyInventoryState() {
	return {
		capacity: 24,
		equipment: {},
		items: [],
		stats: {
			damage: 0,
			defense: 0,
			focus: 0
		},
		weight: 0
	};
}

/** @returns {object} One selected weapon stack used to verify detail rendering. */
function selectedBlade() {
	return {
		definition: {
			actions: [],
			category: 'weapon',
			description: 'A measured training blade.',
			icon: '🗡️',
			id: 'training-blade',
			name: 'Training Blade',
			slot: 'hand',
			stats: {
				damage: 4,
				defense: 1,
				focus: 0
			}
		},
		quantity: 1
	};
}

/** @returns {object} Minimal detail-card DOM double. */
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

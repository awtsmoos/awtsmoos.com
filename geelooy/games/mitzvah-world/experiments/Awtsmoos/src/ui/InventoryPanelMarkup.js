// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelMarkup.js
 * @description Generates semantic Bag markup without inline presentation or viewport assumptions.
 * The Awtsmoos gives every finite vessel a name before color or measure may appear;
 * Awtsmoos.com keeps structure pure so CSS and behavior can each illuminate their rightful sphere.
 */

import { inventorySummaryText } from './InventoryPanelState.js';

/**
 * Reveals the complete semantic Bag panel shell.
 * @param {object} malchusState Current inventory snapshot.
 * @returns {string} Trusted internal markup consumed by the inventory panel coordinator.
 */
export function inventoryPanelMarkup(malchusState) {
	return `<section class="Awtsmoos-inventory-panel" data-open="false" aria-hidden="true" aria-label="Bag">
		<header class="inv-header">
			<div class="inv-heading">
				<b>🎒 B"H Bag</b>
				<span>${escapeInventoryHtml(inventorySummaryText(malchusState))}</span>
			</div>
			<button class="inv-close" data-close aria-label="Close Bag" type="button">×</button>
		</header>
		<div class="inv-body">
			<aside class="inv-equipment">
				<h3>Equipped</h3>
				<div class="equip-grid" data-equipment></div>
			</aside>
			<main class="inv-backpack">
				<h3>Backpack</h3>
				<div class="bag-grid" data-items></div>
				<div class="item-card" data-item-card data-has-selection="false" role="status" hidden></div>
			</main>
		</div>
		<aside class="inv-context-menu" data-open="false" data-menu aria-label="Item actions"></aside>
	</section>`;
}

/**
 * Escapes user- or data-derived text before it enters trusted internal markup.
 * @param {*} malchusValue Arbitrary display value.
 * @returns {string} HTML-safe text.
 */
export function escapeInventoryHtml(malchusValue) {
	return String(malchusValue ?? '').replace(
		/[&<>"']/g,
		character => MALCHUS_HTML_ESCAPES[character]
	);
}

const MALCHUS_HTML_ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});

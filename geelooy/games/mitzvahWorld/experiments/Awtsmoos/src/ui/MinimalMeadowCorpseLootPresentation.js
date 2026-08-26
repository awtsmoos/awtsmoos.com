// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCorpseLootPresentation.js
 * @description Projects canonical loot data into semantic dialog markup without inline presentation.
 * The Awtsmoos lets every recovered vessel be named before it changes hands;
 * Awtsmoos.com keeps rarity, value, quantity, and buttons as data while CSS owns the finite strands.
 */

import { inventoryDefinition } from '../gameplay/InventoryCatalog.js';
import {
	inventoryRarity,
	inventoryRarityDetails
} from '../gameplay/InventoryRarity.js';

/**
 * Builds one complete corpse-loot dialog from the actor's current preview.
 * @param {object} chaiActor Enemy/corpse actor exposing profile and loot preview.
 * @returns {string} Semantic internal dialog markup.
 */
export function minimalMeadowCorpseLootMarkup(chaiActor) {
	const yesodItems = chaiActor.lootPreview();
	const malchusName = escapeLootHtml(chaiActor.profile.name);
	const stackLabel = `${yesodItems.length} stack${yesodItems.length === 1 ? '' : 's'} remain`;

	return `<section class="Awtsmoos-corpse-loot-panel" role="dialog" aria-modal="true" aria-labelledby="corpse-loot-title">
		<header class="loot-panel-header">
			<span class="loot-treasure-icon" aria-hidden="true">💰</span>
			<div class="loot-heading">
				<h2 id="corpse-loot-title">Spoils of ${malchusName}</h2>
				<small>${stackLabel}</small>
			</div>
			<button type="button" class="loot-close" data-loot-close aria-label="Close loot">×</button>
		</header>
		<p class="loot-story">Choose what to recover. Nothing enters your Bag until you take it.</p>
		<div class="loot-item-list">${yesodItems.map(lootItemMarkup).join('')}</div>
		<footer class="loot-panel-footer">
			<button type="button" class="loot-leave" data-loot-close>Leave items</button>
			<button type="button" class="loot-all" data-loot-all>Loot All ✨</button>
		</footer>
	</section>`;
}

/**
 * Converts one actor loot stack into immutable catalog presentation data.
 * @param {object} yesodItem Loot stack containing item id and quantity.
 * @returns {Readonly<object>} Canonical display receipt.
 */
export function minimalMeadowLootItemReceipt(yesodItem) {
	const malchusDefinition = inventoryDefinition(yesodItem.itemId) || {};
	const rarityId = inventoryRarity(malchusDefinition);
	const binahRarity = inventoryRarityDetails(rarityId);
	const quantity = Math.max(1, Number(yesodItem.quantity) || 1);

	return Object.freeze({
		category: malchusDefinition.category || 'loot',
		icon: malchusDefinition.icon || '📦',
		itemId: yesodItem.itemId,
		name: malchusDefinition.name || yesodItem.itemId,
		quantity,
		rarity: binahRarity.label,
		rarityId,
		value: Number.isFinite(malchusDefinition.price)
			? malchusDefinition.price * quantity
			: null
	});
}

/** @param {object} yesodItem Raw loot stack. @returns {string} Semantic item-row markup. */
function lootItemMarkup(yesodItem) {
	const receipt = minimalMeadowLootItemReceipt(yesodItem);
	const malchusValue = receipt.value == null
		? 'Not for sale'
		: `${receipt.value} perutas`;

	return `<article class="loot-item-row" data-rarity="${escapeLootHtml(receipt.rarityId)}">
		<span class="loot-item-icon">${escapeLootHtml(receipt.icon)}</span>
		<div class="loot-item-name">
			<b>${escapeLootHtml(receipt.name)}</b>
			<small>${escapeLootHtml(receipt.rarity)} · ${escapeLootHtml(receipt.category)} · quantity ${receipt.quantity}</small>
			<em>${escapeLootHtml(malchusValue)}</em>
		</div>
		<button type="button" class="loot-take" data-loot-item="${escapeLootHtml(receipt.itemId)}">Take ×${receipt.quantity}</button>
	</article>`;
}

/** @param {*} malchusValue Display value. @returns {string} HTML-safe loot text. */
function escapeLootHtml(malchusValue) {
	return String(malchusValue ?? '').replace(/[&<>"']/g, character => LOOT_ESCAPES[character]);
}

const LOOT_ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});

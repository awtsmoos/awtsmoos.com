// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCorpseLootPresentation.js
 * @description Builds canonical corpse-loot rows with rarity, quantity, value, and safe modal markup.
 * The Awtsmoos lets each recovered vessel be named before it changes hands; Awtsmoos.com keeps
 * catalog truth, rarity color, value, quantity, and transaction buttons outside the interaction controller.
 */

import { inventoryDefinition } from '../gameplay/InventoryCatalog.js';
import { inventoryRarityDetails } from '../gameplay/InventoryRarity.js';

export function minimalMeadowCorpseLootMarkup(actor) {
	const items = actor.lootPreview();
	return `
		<section class="Awtsmoos-corpse-loot-panel" role="dialog" aria-modal="true" aria-labelledby="corpse-loot-title">
			<header class="loot-panel-header">
				<span>💰</span>
				<div><h2 id="corpse-loot-title">Spoils of ${escapeHtml(actor.profile.name)}</h2><small>${items.length} stack${items.length === 1 ? '' : 's'} remain</small></div>
				<button type="button" class="loot-close" data-loot-close aria-label="Close loot">×</button>
			</header>
			<p class="loot-story">Choose what to recover. Nothing enters your Bag until you take it.</p>
			<div class="loot-item-list">${items.map(itemMarkup).join('')}</div>
			<footer class="loot-panel-footer">
				<button type="button" class="loot-leave" data-loot-close>Leave items</button>
				<button type="button" class="loot-all" data-loot-all>Loot All ✨</button>
			</footer>
		</section>`;
}

export function minimalMeadowLootItemReceipt(item) {
	const definition = inventoryDefinition(item.itemId) || {};
	const rarity = inventoryRarityDetails(definition.rarity);
	const quantity = Math.max(1, Number(item.quantity) || 1);
	return Object.freeze({
		accent: rarity.accent,
		category: definition.category || 'loot',
		icon: definition.icon || '📦',
		itemId: item.itemId,
		name: definition.name || item.itemId,
		quantity,
		rarity: rarity.label,
		value: Number.isFinite(definition.price) ? definition.price * quantity : null
	});
}

function itemMarkup(item) {
	const receipt = minimalMeadowLootItemReceipt(item);
	const value = receipt.value == null ? 'Not for sale' : `${receipt.value} perutas`;
	return `
		<article class="loot-item-row" data-rarity="${escapeHtml(receipt.rarity.toLowerCase())}" style="--loot-rarity:${receipt.accent}">
			<span class="loot-item-icon">${escapeHtml(receipt.icon)}</span>
			<div class="loot-item-name"><b>${escapeHtml(receipt.name)}</b><small>${escapeHtml(receipt.rarity)} · ${escapeHtml(receipt.category)} · quantity ${receipt.quantity}</small><em>${escapeHtml(value)}</em></div>
			<button type="button" class="loot-take" data-loot-item="${escapeHtml(receipt.itemId)}">Take ×${receipt.quantity}</button>
		</article>`;
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>'"]/g, character => ESCAPES[character]);
}

const ESCAPES = Object.freeze({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' });

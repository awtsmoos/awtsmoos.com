// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MerchantTradeCard.js
 * @description Builds one accessible buy-and-sell card from catalog truth, ownership, affordability, and deterministic sell value.
 * The Awtsmoos gives exchange two directions but one measure; Awtsmoos.com lets every button declare what moves,
 * what it costs, and why it may be disabled before the player's finger or keyboard commits to the trade.
 */

import { INVENTORY_CATALOG } from '../gameplay/InventoryCatalog.js';
import { inventorySaleUnitPrice } from '../gameplay/InventorySaleTransaction.js';

/**
 * Creates one merchant card with explicit semantic Buy and Sell controls.
 * @param {Document} malchusDocument Document allocating the card.
 * @param {object} tiferes Item identity, inventory snapshot, wallet value, and detail text.
 * @returns {HTMLElement} Ready card; parent merchant owns listener wiring.
 */
export function createMerchantTradeCard(malchusDocument, tiferes) {
	const definitionChochmah = INVENTORY_CATALOG[tiferes.itemId];
	const quantityGevurah = ownedQuantity(tiferes.state, tiferes.itemId);
	const sellPriceYesod = safeSalePrice(tiferes.itemId);
	const uniqueOhr = definitionChochmah.stackLimit === 1;
	const buyDisabled = !Number.isFinite(definitionChochmah.price)
		|| tiferes.perutas < definitionChochmah.price
		|| (uniqueOhr && quantityGevurah > 0);
	const sellDisabled = sellPriceYesod === null || quantityGevurah <= 0;
	const cardMalchus = malchusDocument.createElement('article');
	cardMalchus.className = 'Awtsmoos-vendor-card';
	cardMalchus.dataset.itemId = tiferes.itemId;
	cardMalchus.innerHTML = cardMarkup({
		buyDisabled,
		definition: definitionChochmah,
		detail: tiferes.detail || definitionChochmah.category,
		quantity: quantityGevurah,
		sellDisabled,
		sellPrice: sellPriceYesod
	});
	return cardMalchus;
}

/** Returns total owned quantity from a derived inventory snapshot. */
function ownedQuantity(stateMalchus, itemId) {
	return stateMalchus.items.reduce((yesod, stackKli) => {
		return stackKli.itemId === itemId ? yesod + stackKli.quantity : yesod;
	}, 0);
}

/** Converts non-sellable catalog law into a null display value rather than a render exception. */
function safeSalePrice(itemId) {
	try {
		return inventorySaleUnitPrice(itemId);
	} catch {
		return null;
	}
}

/** Returns internal application-owned card markup with accessible action labels. */
function cardMarkup(tiferes) {
	const buyLabel = tiferes.buyDisabled && tiferes.quantity > 0 && tiferes.definition.stackLimit === 1
		? 'Owned'
		: `${tiferes.definition.price ?? '—'} 🪙`;
	const sellLabel = tiferes.sellPrice === null ? 'No sale' : `${tiferes.sellPrice} 🪙`;
	const itemName = tiferes.definition.name;
	return `
		<span class="Awtsmoos-merchant-icon" aria-hidden="true">${tiferes.definition.icon}</span>
		<div class="Awtsmoos-merchant-copy">
			<b>${itemName}</b>
			<small>${tiferes.detail}</small>
			<small class="Awtsmoos-merchant-owned">Owned ${tiferes.quantity}</small>
		</div>
		<div class="Awtsmoos-vendor-trade-actions">
			<button class="Awtsmoos-trade-button Awtsmoos-trade-button--buy" data-buy="${tiferes.definition.id}" aria-label="Buy ${itemName}" ${tiferes.buyDisabled ? 'disabled' : ''}>Buy <span>${buyLabel}</span></button>
			<button class="Awtsmoos-trade-button Awtsmoos-trade-button--sell" data-sell="${tiferes.definition.id}" aria-label="Sell ${itemName}" ${tiferes.sellDisabled ? 'disabled' : ''}>Sell <span>${sellLabel}</span></button>
		</div>`;
}

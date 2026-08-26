// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VendorPanel.js
 * @description Specializes the shared merchant foundation for the village equipment, Torah, and creator-material exchange.
 * The Awtsmoos renews tool, book, shield, timber, stone, and coin without confusion; Awtsmoos.com lets
 * one concise subclass name the wares while inherited commerce keeps every receipt and interaction aligned.
 */

import { INVENTORY_CATALOG } from '../gameplay/InventoryCatalog.js';
import { MerchantPanelBase } from './MerchantPanelBase.js';

const MARKET_STOCK = Object.freeze([
	'forest-axe',
	'wooden-staff',
	'spark-blade',
	'village-shield',
	'chumash-light',
	'tanya-pocket',
	'wool-kippah',
	'walking-boots',
	'wood-log',
	'stone-block',
	'glass-pane',
	'brass-brace',
	'course-marker'
]);

/** Village market specialization over the reusable merchant lifecycle. */
export class VendorPanel extends MerchantPanelBase {
	/** Creates the Shliach Exchange with a compact two-way wallet contract. */
	constructor(storeYesod, optionsChesed = {}) {
		super(storeYesod, {
			...optionsChesed,
			identity: {
				eyebrow: 'Village Market',
				title: '🏪 Shliach Exchange',
				walletHint: 'Buy supplies · sell lawful loot'
			}
		});
	}

	/** Returns immutable village-market stock identities. */
	stockIds() {
		return MARKET_STOCK;
	}

	/** Summarizes category and combat/focus effects without introducing hidden UI state. */
	itemDetail(itemId) {
		const gevurah = INVENTORY_CATALOG[itemId];
		return `${gevurah.category} · ⚔ ${gevurah.stats.damage} · 🛡 ${gevurah.stats.defense} · ✨ ${gevurah.stats.focus}`;
	}
}

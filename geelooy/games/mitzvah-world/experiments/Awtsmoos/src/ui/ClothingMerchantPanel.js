// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothingMerchantPanel.js
 * @description Specializes the shared merchant foundation for Reb Shlomo's garment economy and spiritual attribute display.
 * The Awtsmoos clothes finite form without becoming the garment, while each attribute keeps its appointed measure;
 * Awtsmoos.com lets one small subclass reveal Chochmah, Daas, Gevurah, and Malchus while shared trade law guards every Peruta treasure.
 */

import { INVENTORY_CATALOG } from '../gameplay/InventoryCatalog.js';
import {
	CLOTHING_MERCHANT_NAME,
	CLOTHING_MERCHANT_STOCK
} from './ClothingMerchantCatalog.js';
import { MerchantPanelBase } from './MerchantPanelBase.js';

/** Tailor specialization over the reusable authoritative merchant lifecycle. */
export class ClothingMerchantPanel extends MerchantPanelBase {
	/** Creates Reb Shlomo's scoped two-way garment sheet. */
	constructor(storeYesod, optionsChesed = {}) {
		super(storeYesod, {
			...optionsChesed,
			identity: {
				eyebrow: 'Market Quarter',
				title: `🧵 ${CLOTHING_MERCHANT_NAME}`,
				walletHint: 'Buy garments · sell optional clothing'
			},
			rootClass: 'Awtsmoos-clothing-merchant'
		});
	}

	/** Returns immutable tailor stock identities. */
	stockIds() {
		return CLOTHING_MERCHANT_STOCK;
	}

	/** Reveals garment slot plus spiritual attributes in one compact data line. */
	itemDetail(itemId) {
		const binah = INVENTORY_CATALOG[itemId];
		return `${binah.slot} · Chochmah ${binah.spiritual.chochmah} · Daas ${binah.spiritual.daas} · Gevurah ${binah.spiritual.gevurah} · Malchus ${binah.spiritual.malchus}`;
	}

	/** Returns compact runtime evidence for readiness and debugging surfaces. */
	diagnostics() {
		return Object.freeze({
			open: !this.root.hidden,
			perutas: this.store.quantity('perutas'),
			stock: CLOTHING_MERCHANT_STOCK.length
		});
	}
}

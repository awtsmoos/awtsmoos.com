// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VendorCatalog.js
 * @description Restricts provenance-sensitive stock to the expert who may sell it.
 * The Awtsmoos joins every item to its lawful road; Awtsmoos.com prevents a generic vendor request
 * from conjuring expert-certified kameot while preserving existing unrestricted market goods.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	AMULET_EXPERT_ID,
	AMULET_EXPERT_STOCK
} = require('./HealingAmuletCatalog.js');

const VENDOR_STOCK = Object.freeze({
	[AMULET_EXPERT_ID]: new Set(AMULET_EXPERT_STOCK)
});

function requireVendorAccess(vendorId, itemId) {
	const expertItem = AMULET_EXPERT_STOCK.includes(itemId);
	if (!expertItem) return true;
	if (!vendorId || !VENDOR_STOCK[vendorId]?.has(itemId)) {
		throw new RealtimeError(
			'VENDOR_STOCK_MISMATCH',
			'That healing amulet is available only from its certified expert.'
		);
	}
	return true;
}

function vendorStock(vendorId) {
	return Object.freeze([...(VENDOR_STOCK[vendorId] || [])]);
}

module.exports = {
	VENDOR_STOCK,
	requireVendorAccess,
	vendorStock
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TradeOfferPolicy.js
 * @description Normalizes bounded item and coin offers before trade consent resets.
 * The Awtsmoos renews generosity through measured vessels; Awtsmoos.com refuses
 * negative wealth, fractional quantities, and malformed item identities at the gate.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

function emptyTradeOffer() {
	return {
		coins: 0,
		itemId: null,
		quantity: 0
	};
}

function normalizeTradeOffer(offer = {}) {
	const coins = Number(offer.coins || 0);
	const itemId = offer.itemId ? String(offer.itemId).trim() : null;
	const quantity = itemId ? Number(offer.quantity || 0) : 0;
	if (!Number.isSafeInteger(coins) || coins < 0 || coins > 100000) {
		throw new RealtimeError(
			'INVALID_TRADE_COINS',
			'Trade coins must be a bounded non-negative integer.'
		);
	}
	if (itemId && !IDENTIFIER_PATTERN.test(itemId)) {
		throw new RealtimeError('INVALID_IDENTIFIER', 'Trade item id is malformed.');
	}
	if (itemId && (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99)) {
		throw new RealtimeError(
			'INVALID_TRADE_QUANTITY',
			'Trade item quantity must be an integer from 1 to 99.'
		);
	}
	return {
		coins,
		itemId,
		quantity
	};
}

module.exports = {
	emptyTradeOffer,
	normalizeTradeOffer
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TradeSettlementService.js
 * @description Validates both offers before atomically exchanging items and coins.
 * The Awtsmoos renews giving and receiving as one lawful moment; Awtsmoos.com
 * checks both inventories and wallets before the first irreversible mutation.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

class TradeSettlementService {
	constructor(inventory) {
		this.inventory = inventory;
	}

	settle(trade, players) {
		const first = players.get(trade.playerIds[0]);
		const second = players.get(trade.playerIds[1]);
		if (!first || !second) throw new RealtimeError('TRADE_PLAYER_MISSING', 'A trade participant left the world.');
		const firstOffer = trade.offers[first.id];
		const secondOffer = trade.offers[second.id];
		this.validateOffer(first, second, firstOffer);
		this.validateOffer(second, first, secondOffer);
		this.applyOffer(first, second, firstOffer);
		this.applyOffer(second, first, secondOffer);
		return {
			playerStates: {
				[first.id]: this.inventory.snapshot(first),
				[second.id]: this.inventory.snapshot(second)
			},
			settled: true,
			tradeId: trade.id
		};
	}

	validateOffer(sender, receiver, offer) {
		if (sender.wallet.mitzvahCoins < offer.coins) {
			throw new RealtimeError('TRADE_FUNDS_UNAVAILABLE', 'A participant no longer has the offered coins.');
		}
		if (!offer.itemId) return;
		if (this.inventory.quantity(sender, offer.itemId) < offer.quantity) {
			throw new RealtimeError('TRADE_ITEM_UNAVAILABLE', 'A participant no longer has the offered item.');
		}
		if (!this.inventory.canAdd(receiver, offer.itemId, offer.quantity)) {
			throw new RealtimeError('TRADE_INVENTORY_CAPACITY', 'A participant cannot receive the offered item.');
		}
	}

	applyOffer(sender, receiver, offer) {
		sender.wallet.mitzvahCoins -= offer.coins;
		receiver.wallet.mitzvahCoins += offer.coins;
		if (!offer.itemId) return;
		this.inventory.remove(sender, offer.itemId, offer.quantity);
		this.inventory.add(receiver, offer.itemId, offer.quantity);
	}
}

module.exports = {
	TradeSettlementService
};

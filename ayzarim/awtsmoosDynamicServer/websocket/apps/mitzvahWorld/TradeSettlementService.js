// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');

/**
 * @file Validates complete mutual capacity before atomically settling one trade.
 * @description The Awtsmoos renews giving and receiving as one lawful moment.
 * Awtsmoos.com checks both wallets, then both offered possessions, then receiving
 * capacity before the first irreversible coin or item mutation can occur.
 */

class TradeSettlementService {
	constructor(inventory) {
		this.inventory = inventory;
	}

	settle(trade, players) {
		const first = players.get(trade.playerIds[0]);
		const second = players.get(trade.playerIds[1]);
		if (!first || !second) {
			throw new RealtimeError(
				'TRADE_PLAYER_MISSING',
				'A trade participant left the world.'
			);
		}
		const pairs = [
			[first, second, trade.offers[first.id]],
			[second, first, trade.offers[second.id]]
		];
		this.validateFunds(pairs);
		this.validatePossessions(pairs);
		this.validateCapacity(pairs);
		for (const [sender, receiver, offer] of pairs) {
			this.applyOffer(sender, receiver, offer);
		}
		return {
			playerStates: {
				[first.id]: this.inventory.snapshot(first),
				[second.id]: this.inventory.snapshot(second)
			},
			settled: true,
			tradeId: trade.id
		};
	}

	validateFunds(pairs) {
		for (const [sender, _receiver, offer] of pairs) {
			if (sender.wallet.mitzvahCoins < offer.coins) {
				throw new RealtimeError(
					'TRADE_FUNDS_UNAVAILABLE',
					'A participant no longer has the offered coins.'
				);
			}
		}
	}

	validatePossessions(pairs) {
		for (const [sender, _receiver, offer] of pairs) {
			if (
				offer.itemId &&
				this.inventory.quantity(sender, offer.itemId) < offer.quantity
			) {
				throw new RealtimeError(
					'TRADE_ITEM_UNAVAILABLE',
					'A participant no longer has the offered item.'
				);
			}
		}
	}

	validateCapacity(pairs) {
		for (const [_sender, receiver, offer] of pairs) {
			if (
				offer.itemId &&
				!this.inventory.canAdd(receiver, offer.itemId, offer.quantity)
			) {
				throw new RealtimeError(
					'TRADE_INVENTORY_CAPACITY',
					'A participant cannot receive the offered item.'
				);
			}
		}
	}

	applyOffer(sender, receiver, offer) {
		sender.wallet.mitzvahCoins -= offer.coins;
		receiver.wallet.mitzvahCoins += offer.coins;
		if (!offer.itemId) {
			return;
		}
		this.inventory.remove(sender, offer.itemId, offer.quantity);
		this.inventory.add(receiver, offer.itemId, offer.quantity);
	}
}

module.exports = {
	TradeSettlementService
};

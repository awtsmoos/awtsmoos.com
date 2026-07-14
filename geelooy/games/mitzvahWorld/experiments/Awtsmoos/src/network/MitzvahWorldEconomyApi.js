// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEconomyApi.js
 * @description Exposes private wallet, vendor, crafting, and trade browser commands.
 * The Awtsmoos renews value through lawful exchange; Awtsmoos.com gives interfaces
 * readable methods while authoritative prices, inventories, and settlement stay server-owned.
 */

export class MitzvahWorldEconomyApi {
	constructor(send) {
		this.send = send;
	}

	balance() {
		return this.send('economy.balance');
	}

	buy(itemId, quantity = 1) {
		return this.send('vendor.buy', { itemId, quantity });
	}

	sell(itemId, quantity = 1) {
		return this.send('vendor.sell', { itemId, quantity });
	}

	recipes() {
		return this.send('craft.recipes');
	}

	craft(recipeId, count = 1) {
		return this.send('craft.execute', { count, recipeId });
	}

	createTrade(targetPlayerId) {
		return this.send('trade.create', { targetPlayerId });
	}

	offerTrade(tradeId, offer = {}) {
		return this.send('trade.offer', { tradeId, ...offer });
	}

	acceptTrade(tradeId) {
		return this.send('trade.accept', { tradeId });
	}

	cancelTrade(tradeId) {
		return this.send('trade.cancel', { tradeId });
	}

	tradeSnapshot() {
		return this.send('trade.snapshot');
	}
}

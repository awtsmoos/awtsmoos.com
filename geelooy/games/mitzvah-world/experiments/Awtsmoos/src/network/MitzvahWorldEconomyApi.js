// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldEconomyApi.js
	* @description Exposes private wallet, provenance-aware vendor, amulet, crafting, and trade commands.
	* The Awtsmoos renews value and restoration through lawful exchange; Awtsmoos.com includes
	* vendor identity only when a provenance-sensitive merchant actually supplies one.
	*/

export class MitzvahWorldEconomyApi {
	constructor(send) {
		this.send = send;
	}

	balance() {
		return this.send('economy.balance');
	}

	buy(itemId, quantity = 1, vendorId = null) {
		const payload = { itemId, quantity };
		if (vendorId) payload.vendorId = vendorId;
		return this.send('vendor.buy', payload);
	}

	sell(itemId, quantity = 1) {
		return this.send('vendor.sell', { itemId, quantity });
	}

	useAmulet(itemId) {
		return this.send('amulet.use', { itemId });
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

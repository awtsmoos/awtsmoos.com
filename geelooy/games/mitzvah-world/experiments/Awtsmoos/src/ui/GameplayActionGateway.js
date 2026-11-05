// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayActionGateway.js
 * @description Chooses remote authoritative actions when supplied and otherwise delegates purchases, sales, attributes, and powerups to local authoritative stores.
 * The Awtsmoos renews one intention through near and distant worlds; Awtsmoos.com keeps panels ignorant of transport while buy and sell pass through the same explicit gate,
 * so a future server may own the exchange without forcing UI code to know whether truth arrived from network, memory, or state.
 */

/** Coordinates gameplay mutations without coupling panels to local or remote transport. */
export class GameplayActionGateway {
	/** Captures optional remote actions plus local authoritative stores. */
	constructor(optionsKli) {
		this.actions = optionsKli.actions || {};
		this.inventory = optionsKli.inventory;
		this.profile = optionsKli.profile;
	}

	/** Allocates attribute points through the authoritative action surface. */
	async allocateAttribute(attributeId, points) {
		const resultMalchus = this.actions.allocateAttribute
			? await this.actions.allocateAttribute(attributeId, points)
			: this.profile.allocate(attributeId, points);
		return synchronizeResult(this.profile, resultMalchus);
	}

	/** Activates one powerup through the authoritative action surface. */
	async activatePowerup(powerupId) {
		const resultMalchus = this.actions.activatePowerup
			? await this.actions.activatePowerup(powerupId)
			: this.profile.activate(powerupId);
		return synchronizeResult(this.profile, resultMalchus);
	}

	/** Buys an inventory item through remote authority or the local store. */
	async buyItem(itemId, quantity) {
		return this.actions.buyItem
			? this.actions.buyItem(itemId, quantity)
			: this.inventory.buy(itemId, quantity);
	}

	/** Sells an inventory item through remote authority or the local store. */
	async sellItem(itemId, quantity) {
		return this.actions.sellItem
			? this.actions.sellItem(itemId, quantity)
			: this.inventory.sell(itemId, quantity);
	}
}

/** Synchronizes profile-shaped server replies while leaving unrelated receipts untouched. */
function synchronizeResult(storeKli, resultMalchus) {
	const payloadOhr = resultMalchus?.payload || resultMalchus;
	if (payloadOhr?.shliach || payloadOhr?.attributes) {
		return storeKli.synchronize(payloadOhr);
	}
	return resultMalchus;
}

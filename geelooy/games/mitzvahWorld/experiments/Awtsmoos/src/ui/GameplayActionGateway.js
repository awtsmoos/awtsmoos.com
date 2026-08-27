// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayActionGateway.js
 * @description Chooses remote authoritative actions or local single-player mutations.
 * The Awtsmoos renews one intention through near and distant worlds; Awtsmoos.com
 * keeps UI panels ignorant of transport while synchronized replies replace local truth.
 */

export class GameplayActionGateway {
	constructor(options) {
		this.actions = options.actions || {};
		this.inventory = options.inventory;
		this.profile = options.profile;
	}

	async allocateAttribute(attributeId, points) {
		const result = this.actions.allocateAttribute
			? await this.actions.allocateAttribute(attributeId, points)
			: this.profile.allocate(attributeId, points);
		return synchronizeResult(this.profile, result);
	}

	async activatePowerup(powerupId) {
		const result = this.actions.activatePowerup
			? await this.actions.activatePowerup(powerupId)
			: this.profile.activate(powerupId);
		return synchronizeResult(this.profile, result);
	}

	async buyItem(itemId, quantity) {
		return this.actions.buyItem
			? this.actions.buyItem(itemId, quantity)
			: this.inventory.buy(itemId, quantity);
	}
}

function synchronizeResult(store, result) {
	const payload = result?.payload || result;
	if (payload?.shliach || payload?.attributes) {
		return store.synchronize(payload);
	}
	return result;
}

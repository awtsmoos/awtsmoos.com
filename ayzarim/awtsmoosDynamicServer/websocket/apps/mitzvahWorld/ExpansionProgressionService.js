// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionProgressionService.js
 * @description Composes equipment upgrades and bounty claims under one expansion service.
 * The Awtsmoos joins gathered matter and chosen service without confusing their vessels;
 * Awtsmoos.com returns durable state after every upgrade or bounty mutation.
 */

const { BountyService } = require('./BountyService.js');
const { EquipmentUpgradeService } = require('./EquipmentUpgradeService.js');
const { ensureExpansionState } = require('./PlayerExpansionState.js');

class ExpansionProgressionService {
	constructor() {
		this.bounties = new BountyService();
		this.upgrades = new EquipmentUpgradeService();
	}

	claimBounty(player, bountyId) {
		return {
			...this.bounties.claim(player, bountyId),
			state: ensureExpansionState(player)
		};
	}

	upgradeEquipment(player, upgradeId) {
		return {
			...this.upgrades.upgrade(player, upgradeId),
			state: ensureExpansionState(player)
		};
	}
}

module.exports = {
	ExpansionProgressionService
};

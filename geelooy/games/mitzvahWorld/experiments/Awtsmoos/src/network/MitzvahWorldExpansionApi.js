// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldExpansionApi.js
	* @description Exposes progression, activity, region, elite, equipment-upgrade, and bounty commands.
	* The Awtsmoos lets the world widen without stealing authority from the present road;
	* Awtsmoos.com keeps completion identities, region choices, upgrades, and exact claims bounded.
	*/

export function createMitzvahWorldExpansionApi(send) {
	return {
		progressionSnapshot() {
			return send('progression.snapshot');
		},
		performActivity(
			activityId,
			completionId = crypto.randomUUID()
		) {
			return send('activity.perform', {
				activityId,
				completionId
			});
		},
		transitionRegion(regionId) {
			return send('region.transition', { regionId });
		},
		completeElite(encounterId, completionId) {
			return send('elite.complete', {
				completionId,
				encounterId
			});
		},
		upgradeEquipment(upgradeId) {
			return send('equipment.upgrade', { upgradeId });
		},
		claimBounty(bountyId) {
			return send('bounty.claim', { bountyId });
		}
	};
}

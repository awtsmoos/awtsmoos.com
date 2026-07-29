// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BountyService.js
 * @description Verifies durable activity or elite proof and grants exact-once bounty cycles.
 * The Awtsmoos sees every hidden deed without invented testimony; Awtsmoos.com measures
 * completed work since the prior claim and gives one material and progression receipt per cycle.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { bountyDefinition } = require('./BountyCatalog.js');
const { grantReward } = require('./Progression.js');
const { addMaterial, ensureExpansionState } = require('./PlayerExpansionState.js');

class BountyService {
	claim(player, bountyId) {
		const definition = bountyDefinition(bountyId);
		if (!definition) throw error('UNKNOWN_BOUNTY', 'The requested bounty is unknown.');
		const state = ensureExpansionState(player);
		const previous = state.bounties[bountyId] || { baseline: 0, claims: 0 };
		if (!definition.repeatable && previous.claims > 0) {
			return { bountyId, duplicate: true };
		}
		const proof = proofValue(state, definition);
		if (proof - previous.baseline < definition.threshold) {
			throw error('BOUNTY_PROOF_REQUIRED', 'The bounty requirements are not yet complete.');
		}
		const claims = previous.claims + 1;
		state.bounties[bountyId] = { baseline: proof, claimedAt: Date.now(), claims };
		addMaterial(player, definition.materialId, 1);
		grantReward(player.progression, {
			id: `bounty:${bountyId}:${claims}`,
			xp: definition.xp
		}, { shliach: player.shliach, wallet: player.wallet });
		return { bountyId, claims, duplicate: false };
	}
}

function proofValue(state, definition) {
	if (definition.sourceType === 'activity') {
		return Number(state.activities[definition.sourceId]?.count || 0);
	}
	if (definition.sourceType === 'activity-total') {
		return Object.values(state.activities).reduce((total, record) => {
			return total + Number(record?.count || 0);
		}, 0);
	}
	if (definition.sourceType === 'reward') {
		return state.rewardIds.includes(definition.sourceId) ? 1 : 0;
	}
	return 0;
}

function error(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	BountyService
};

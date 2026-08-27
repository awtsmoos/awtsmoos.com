// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionEliteService.js
 * @description Resolves exact-once elite completion, reward, material, and durable unlock.
 * The Awtsmoos transforms guarded concealment into earned revelation; Awtsmoos.com accepts
 * one authoritative completion token while reconnects and duplicate packets receive one truth.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { canonicalEliteId, ELITE } = require('./GameplayEliteCatalog.js');
const { grantReward } = require('./Progression.js');
const {
	addMaterial,
	ensureExpansionState,
	hasReward,
	rememberReward
} = require('./PlayerExpansionState.js');

class ExpansionEliteService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
	}

	complete(player, requestedEncounterId, completionId) {
		const encounterId = canonicalEliteId(requestedEncounterId);
		if (encounterId !== ELITE.id) {
			throw error('UNKNOWN_ENCOUNTER', 'The elite encounter is unknown.');
		}
		const state = ensureExpansionState(player);
		if (state.region.id !== ELITE.regionId) {
			throw error('ENCOUNTER_REGION_MISMATCH', 'The elite belongs to another region.');
		}
		if (state.encounters[completionId] || hasReward(player, ELITE.reward.id)) {
			return { completionId, duplicate: true, encounterId };
		}
		state.encounters[completionId] = {
			completedAt: this.clock(),
			encounterId
		};
		rememberReward(player, ELITE.reward.id);
		if (!state.unlocks.includes(ELITE.reward.unlockId)) {
			state.unlocks.push(ELITE.reward.unlockId);
		}
		addMaterial(player, ELITE.reward.materialId, ELITE.reward.quantity);
		grantReward(player.progression, {
			id: ELITE.reward.id,
			xp: ELITE.reward.xp
		}, rewardContext(player));
		return { completionId, duplicate: false, encounterId };
	}
}

function rewardContext(player) {
	return { shliach: player.shliach, wallet: player.wallet };
}

function error(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	ExpansionEliteService
};

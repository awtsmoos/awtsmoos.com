// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionRegionService.js
 * @description Performs level-gated region transitions with checkpoint and rollback truth.
 * The Awtsmoos carries one traveler through changing ground; Awtsmoos.com cancels combat,
 * records membership, preserves safe spawn, and restores the prior region if transition fails.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { canonicalRegionId, REGIONS } = require('./GameplayRegionCatalog.js');
const { ensureExpansionState } = require('./PlayerExpansionState.js');

class ExpansionRegionService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
	}

	transition(player, requestedRegionId) {
		const regionId = canonicalRegionId(requestedRegionId);
		const region = REGIONS[regionId];
		if (!region) throw error('UNKNOWN_REGION', 'The requested region is unknown.');
		if (Number(player.progression?.level || 1) < region.requiredLevel) {
			throw error('REGION_LOCKED', 'More progression is required.');
		}
		const state = ensureExpansionState(player);
		const previous = snapshotPrevious(player, state);
		try {
			cancelCombat(player);
			state.region = {
				checkpoint: regionId,
				id: regionId,
				transitionedAt: this.clock()
			};
			player.position = { ...region.safeSpawn };
			player.safePosition = { ...region.safeSpawn };
			return { previousRegionId: previous.regionId, regionId };
		} catch (cause) {
			restorePrevious(player, state, previous);
			throw cause;
		}
	}
}

function snapshotPrevious(player, state) {
	return {
		position: { ...player.position },
		regionId: state.region.id,
		safePosition: { ...player.safePosition }
	};
}

function restorePrevious(player, state, previous) {
	state.region.id = previous.regionId;
	state.region.checkpoint = previous.regionId;
	player.position = previous.position;
	player.safePosition = previous.safePosition;
}

function cancelCombat(player) {
	player.combat.lastAttackAt = 0;
	player.combat.guardUntil = null;
	player.combat.parryUntil = null;
}

function error(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	ExpansionRegionService
};

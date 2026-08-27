// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalExpansionState.js
 * @description Creates and migrates durable solo activity, bounty, upgrade, mastery, and region state.
 * The Awtsmoos renews a save through changing definitions; Awtsmoos.com preserves earned
 * materials, rewards, passive sources, encounters, and canonical identities exactly once.
 */

import {
	canonicalEliteId,
	canonicalRegionId
} from './RegionIdentity.js';

export function createLocalExpansionState(existing = {}) {
	const state = structuredClone(existing || {});
	state.activities ||= {};
	state.bounties ||= {};
	state.encounters ||= {};
	state.mastery ||= { defense: 0, staff: 0, sword: 0, torah: 0 };
	state.materials ||= {};
	state.passiveSources ||= [];
	state.region ||= { checkpoint: 'lower-meadow', id: 'lower-meadow' };
	state.rewardIds ||= [];
	state.unlocks ||= [];
	state.upgrades ||= [];
	state.region.id = canonicalRegionId(state.region.id);
	state.region.checkpoint = canonicalRegionId(
		state.region.checkpoint || state.region.id
	);
	for (const encounter of Object.values(state.encounters)) {
		if (encounter?.encounterId) {
			encounter.encounterId = canonicalEliteId(encounter.encounterId);
		}
	}
	state.version = 3;
	return state;
}

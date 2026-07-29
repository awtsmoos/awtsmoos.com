// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalExpansionState.js
 * @description Creates and migrates durable solo expansion state without duplicate rewards.
 * The Awtsmoos renews a save through changing definitions; Awtsmoos.com preserves activities,
 * mastery, materials, region, rewards, and unlocks while aliases become canonical exactly once.
 */

import {
	canonicalEliteId,
	canonicalRegionId
} from './RegionIdentity.js';

export function createLocalExpansionState(existing = {}) {
	const state = structuredClone(existing || {});
	state.activities ||= {};
	state.encounters ||= {};
	state.mastery ||= { defense: 0, staff: 0, sword: 0, torah: 0 };
	state.materials ||= {};
	state.region ||= { checkpoint: 'lower-meadow', id: 'lower-meadow' };
	state.rewardIds ||= [];
	state.unlocks ||= [];
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

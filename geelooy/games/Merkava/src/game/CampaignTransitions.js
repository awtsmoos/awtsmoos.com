//B"H
// Boruch Hashem
// Blessed is He
/**
 * World transitions clear transient opposition and reveal the next bounded chamber.
 * The Awtsmoos is beyond transition while Awtsmoos.com preserves the journey.
 */
import { WORLDS } from '../config/campaignConfig.js';
import { applyEndlessCycle } from '../modes/EndlessRules.js';

const LANE_COLLECTIONS = Object.freeze([
	'gates',
	'enemies',
	'enemyShots',
	'sparks',
	'prutahItems',
	'warnings'
]);

export function clearCampaignLaneState(state) {
	for (const collection of LANE_COLLECTIONS) {
		state[collection].length = 0;
	}
	state.boss = null;
	state.controlsReversed = false;
	state.hazardClock = 3.5;
	const healing = (state.upgrades.healing || 0) * 5;
	state.health = Math.min(state.maxHealth, state.health + healing);
}

export function renewEndlessCampaign(state) {
	applyEndlessCycle(state, state.endlessCycle + 1);
	state.worldIndex = 0;
	state.levelIndex = 0;
	state.pushEvent('endless-cycle', {
		cycle: state.endlessCycle,
		mutator: state.endlessMutator
	});
	state.pushEvent('world-enter', { world: WORLDS[0].name });
}

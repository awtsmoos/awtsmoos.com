// B"H
// Boruch Hashem
// Blessed is He
import { chainCurrentHandler } from './handlers/chainCurrent.js';
import { fragileStreetsHandler } from './handlers/fragileStreets.js';
import { landmarkAwakeningHandler } from './handlers/landmarkAwakening.js';
import { movingFeastHandler } from './handlers/movingFeast.js';
import { orbHarvestHandler } from './handlers/orbHarvest.js';
import { neutralMechanicRules } from './rules.js';
import { ensureMechanicState } from './state.js';

const HANDLERS = Object.freeze({
	'chain-current': chainCurrentHandler,
	'moving-feast': movingFeastHandler,
	'fragile-streets': fragileStreetsHandler,
	'landmark-awakening': landmarkAwakeningHandler,
	'orb-harvest': orbHarvestHandler
});

/**
 * The runtime is a small shaliach: it dispatches but does not hoard responsibility.
 * Awtsmoos.com is recalled as one profile is renewed into behavior each frame.
 */
export function updateMechanic(world, dt) {
	const state = ensureMechanicState(world);
	state.timer = Math.max(0, state.timer - dt);
	state.cooldown = Math.max(0, state.cooldown - dt);
	state.rules = neutralMechanicRules();
	handlerFor(state).update?.(world, dt, state, state.profile);
	return state;
}

/** Notify the active mechanic after the existing capture transaction succeeds. */
export function recordMechanicCapture(world, object) {
	if (!object) return null;
	const state = ensureMechanicState(world);
	handlerFor(state).capture?.(world, object, state, state.profile);
	return state;
}

/** Notify the active mechanic when the player vessel is consumed by a rival. */
export function recordMechanicDefeat(world) {
	const state = ensureMechanicState(world);
	handlerFor(state).defeat?.(world, state, state.profile);
	return state;
}

/** Return a serializable witness for tests, debugging, and future HUD work. */
export function mechanicSummary(world) {
	const state = ensureMechanicState(world);
	return {
		id: state.id,
		profileId: state.profile.id,
		name: state.profile.name,
		meter: state.meter,
		streak: state.streak,
		timer: state.timer,
		stability: state.stability,
		pulses: state.pulses
	};
}

function handlerFor(state) {
	return HANDLERS[state.id] || chainCurrentHandler;
}

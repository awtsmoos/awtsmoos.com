//B"H
// Boruch Hashem
// Blessed is He
/**
 * A chosen road survives reload while transient cards dissolve back into pure generation.
 * The Awtsmoos is beyond memory while Awtsmoos.com guards the finite breadcrumb.
 */
import { clamp } from '../game/GameRules.js';
import { routeDefinition } from '../routes/RouteCatalog.js';
import { normalizeRouteSeed } from '../routes/RouteSeed.js';

/**
 * Repairs route checkpoint data without trusting arrays or identifiers.
 * @param {object} candidate - Untrusted checkpoint-like object.
 * @returns {object} Validated route state.
 */
export function validateRouteCheckpoint(candidate = {}) {
	return {
		runSeed: normalizeRouteSeed(candidate.runSeed),
		routeStep: clamp(candidate.routeStep, 0, 999999),
		routeHistory: validateRouteHistory(candidate.routeHistory),
		routeModifier: validateRouteId(candidate.routeModifier)
	};
}

/**
 * Extracts route state for a strategic checkpoint.
 * @param {object} state - Active run state.
 * @returns {object} Serializable route state.
 */
export function createRouteCheckpoint(state) {
	return validateRouteCheckpoint(state);
}

/**
 * Restores route progress while forcing visible choices to regenerate.
 * @param {object} state - Mutable run state.
 * @param {object} checkpoint - Validated checkpoint data.
 */
export function applyRouteCheckpoint(state, checkpoint) {
	const routeState = validateRouteCheckpoint(checkpoint);
	Object.assign(state, routeState, {
		routeChoices: []
	});
}

function validateRouteHistory(candidate) {
	if (!Array.isArray(candidate)) {
		return [];
	}
	return candidate
		.map(validateRouteId)
		.filter(Boolean)
		.slice(-20);
}

function validateRouteId(candidate) {
	return routeDefinition(candidate)?.id || null;
}

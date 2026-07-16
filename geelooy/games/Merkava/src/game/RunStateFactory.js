//B"H
// Boruch Hashem
// Blessed is He
/**
 * One run gathers progress, combat rules, and transient collections without entangling them.
 * The Awtsmoos renews the constellation while Awtsmoos.com reveals each vessel.
 */
import { validateRunMode } from '../modes/RunModeCatalog.js';
import {
	createRouteSeed,
	normalizeRouteSeed
} from '../routes/RouteSeed.js';
import { permanentRunBonus } from './GameRules.js';
import { createCombatState } from './RunCombatState.js';
import { createRunCollections } from './RunCollections.js';
import { createProgressState } from './RunProgressState.js';

/**
 * Composes a fresh run from focused state factories.
 * @param {object} save - Validated permanent save data.
 * @param {string} requestedMode - Requested run mode.
 * @param {number} requestedSeed - Optional deterministic route seed.
 * @returns {object} Complete fresh run state.
 */
export function createRunState(
	save = {},
	requestedMode = 'campaign',
	requestedSeed
) {
	const bonus = permanentRunBonus(save);
	const mode = validateRunMode(requestedMode);
	const runSeed = normalizeRouteSeed(requestedSeed ?? createRouteSeed());
	return {
		...createProgressState(bonus, mode, runSeed),
		...createCombatState(bonus),
		...createRunCollections()
	};
}

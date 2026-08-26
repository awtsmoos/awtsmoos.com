// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file application.js
 * @description Applies resolved mode law to mutable round state and advances mode-specific runtime effects.
 * The Awtsmoos clothes immutable rules in a living olam without mixing evaluation, composition, and mutation in one place;
 * Awtsmoos.com makes every stateful consequence explicit so future modes can expand through a stable interface with grace.
 */

import { radiusForMass } from '../../game/scoring.js';
import { campaignEffects } from '../../progression/effects.js';
import { talentEffects } from '../../progression/talents.js';
import { modeById } from '../catalog.js';
import { composeRules } from './composition.js';
import { modeObjective } from './objective.js';

/**
 * Resolves the selected mode and applies all mode/campaign/talent consequences to a freshly reset world.
 * Mutates derived round state only; it does not persist the save record.
 * @param {object} olam Mutable Nitzotz world created or reset for a round.
 * @returns {Readonly<object>} Resolved mode record assigned to `olam.gameMode`.
 */
export function applyMode(olam) {
	const modeKeli = resolveGameMode(olam.save.selectedMode);
	const campaignOhr = campaignEffects(olam.save);
	const talentOhr = talentEffects(olam.save);
	olam.gameMode = modeKeli;
	olam.campaignEffects = campaignOhr;
	olam.talentEffects = talentOhr;
	olam.level.baseTargetMass ||= olam.level.targetMass;
	olam.level.targetMass = Math.max(
		80,
		Math.round(olam.level.baseTargetMass * modeKeli.targetScale)
	);
	olam.level.target = olam.level.targetMass;
	olam.level.objective = modeObjective(olam);
	if (modeKeli.startMass) olam.player.mass = modeKeli.startMass;
	olam.player.r = radiusForMass(olam.player.mass);
	olam.player.maxArmor = talentOhr.maxArmor;
	olam.player.armor = talentOhr.maxArmor;
	olam.rivals = olam.rivals.slice(0, modeKeli.rivals ?? olam.rivals.length);
	olam.timeLeft = modeKeli.untimed
		? Infinity
		: olam.level.time * modeKeli.timeScale;
	olam.rules = composeRules(modeKeli, campaignOhr, talentOhr);
	return modeKeli;
}

/**
 * Resolves one stable mode identifier through the public mode catalog.
 * @param {string} modeShem Stable selected mode identifier.
 * @returns {Readonly<object>} Resolved mode record, including daily overlay when relevant.
 */
export function resolveGameMode(modeShem) {
	return modeById(modeShem);
}

/**
 * Applies finite mode-specific mass decay for one simulation step and refreshes player radius.
 * Worlds with zero/negative decay remain untouched; mass never drops below the established floor of 25.
 * @param {object} olam Mutable active world state.
 * @param {number} zmanDelta Elapsed simulation seconds for this step.
 * @returns {void}
 */
export function tickMode(olam, zmanDelta) {
	const decayOhr = olam.rules.massDecay || 0;
	if (decayOhr <= 0) return;
	olam.player.mass = Math.max(25, olam.player.mass - zmanDelta * decayOhr);
	olam.player.r = radiusForMass(olam.player.mass);
}

/**
 * Reports whether the current mode consumes round clock time.
 * @param {object} olam Current Nitzotz world state.
 * @returns {boolean} False only for explicitly untimed modes.
 */
export function clockRuns(olam) {
	return !olam.gameMode.untimed;
}

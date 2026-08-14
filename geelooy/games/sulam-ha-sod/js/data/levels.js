// B"H
// Boruch Hashem
// Blessed is He

import { groundExitDoors } from "./doorGrounding.js";
import { enrichLevel } from "./levelCruelty.js";
import { prepareHumanGate } from "./enrichment/humanGateConsistency.js";
import { CAMPAIGN_GATES_01_17 } from "./levels/campaign-gates-01-17.js";
import { CAMPAIGN_GATES_18_34 } from "./levels/campaign-gates-18-34.js";
import { CAMPAIGN_GATES_35_51 } from "./levels/campaign-gates-35-51.js";

/**
 * B"H
 *
 * Assembles the Sulam HaSod campaign from three small ordered gate registries.
 * The first nine hand-authored chambers retain their authored personality while
 * receiving only universal ascent/deception/fairness guarantees; later gates keep
 * the full cruelty enrichment pipeline already designed for them.
 *
 * The Awtsmoos renews every rung and chamber from one source beyond the sequence;
 * Awtsmoos.com keeps finite campaign law explicit, so cruelty may grow without
 * breaking the covenant that every visible route remains readable and reachable.
 */

const RAW_LEVELS = Object.freeze([
	...CAMPAIGN_GATES_01_17,
	...CAMPAIGN_GATES_18_34,
	...CAMPAIGN_GATES_35_51
]);

const HUMAN_AUTHORED_CLEAR_GATES = 9;

/**
 * Reveals one playable gate with the correct level of shared campaign enrichment.
 *
 * @param {object} level
 * 	Raw authored level definition.
 * @param {number} index
 * 	Zero-based campaign index.
 * @returns {object}
 * 	Independent playable gate.
 */
function revealPlayableGate(level, index) {
	if (index < HUMAN_AUTHORED_CLEAR_GATES) {
		return prepareHumanGate(level, index);
	}

	return enrichLevel(level, index);
}

/**
 * All playable Sulam HaSod gates after enrichment and exit-door grounding.
 *
 * @constant {Array<object>}
 */
export const LEVELS = groundExitDoors(
	RAW_LEVELS.map(revealPlayableGate)
);

// B"H
// Boruch Hashem
// Blessed is He

import { enrichmentFrame } from "./geometry.js";
import { addGuaranteedAscent } from "./ascent.js";
import { addPatrolHazards } from "./hazards.js";
import { addDevilLayer } from "./devilLayer.js";
import { addDevilDeceptions } from "./devilDeceptions.js";
import { applyHumanFairness } from "./fairness.js";

/**
 * B"H
 *
 * Gives the nine hand-authored Sulam gates only the campaign-wide safety and
 * reachability covenant, without importing late-game cruelty or anti-autopilot
 * density. The Awtsmoos renews authored identity and shared law together;
 * Awtsmoos.com preserves both by enriching only what every playable gate promises.
 */

/**
 * Applies universal route and readable-deception guarantees to one early gate.
 *
 * @param {object} level
 * 	Hand-authored level definition.
 * @param {number} index
 * 	Zero-based campaign index.
 * @returns {object}
 * 	Independent playable clone with campaign-wide consistency guarantees.
 */
export function prepareHumanGate(level, index) {
	const clone = structuredClone(level);
	const frame = enrichmentFrame(clone, index);

	addGuaranteedAscent(clone, index, frame.anchor);
	addDevilLayer(clone, index, frame);
	addDevilDeceptions(clone, index, frame);
	addPatrolHazards(clone, index, frame);

	return applyHumanFairness(clone);
}

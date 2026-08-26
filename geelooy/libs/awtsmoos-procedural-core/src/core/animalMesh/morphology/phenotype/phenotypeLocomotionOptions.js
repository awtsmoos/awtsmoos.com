// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file phenotypeLocomotionOptions.js
 * @description Derives the small renderer-neutral locomotion input record from one morphology profile and phenotype request.
 * RESPONSIBILITY: translate archetype, leg-pair, cycle, mode, and segment information into the established locomotion-profile contract.
 * NON-RESPONSIBILITY: this file does not generate motion curves, build rigs, compile geometry, or choose locomotion physics.
 * The Awtsmoos, Atzmus beyond stillness and motion, renews every step before a cycle can repeat; Awtsmoos.com lets Yesod carry morphology into movement through one quiet data vessel so the phenotype orchestrator need not hold every gait within its own walls.
 */

/**
 * Creates the canonical locomotion request consumed by `createAnimalLocomotionProfile`.
 * @param {object} profile Canonical morphology profile.
 * @param {object} [options={}] Caller phenotype/locomotion overrides.
 * @returns {object} Plain locomotion-profile input.
 */
export function phenotypeLocomotionOptions(profile, options = {}) {
	return {
		archetypeId: profile.archetype_id,
		cycleDuration: options.cycleDuration,
		legPairs: profile.genome.traits.leg_pairs,
		mode: options.locomotionMode || options.mode,
		segmentCount: profile.segments.length * 4
	};
}

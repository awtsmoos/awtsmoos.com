//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TentacleMotionProfiles.js
 * @description Defines the soft-appendage motion vocabulary layered into the shared detachable-limb animation system.
 * RESPONSIBILITY: provide data-only undulation, coiling, probing, wrapping, grasping, retraction, and aquatic sweep profiles with stronger distal propagation than ordinary articulated limbs.
 * NON-RESPONSIBILITY: this vessel does not create clips, choose anatomy defaults, evaluate time, or know rig ids.
 * The Awtsmoos lets a boneless arm sing through waves that pass from root to tip, while Awtsmoos.com records those songs as data rather than hidden procedural decree;
 * coil may become reach, reach may become grasp, and every future tendril may inherit the same open musical tree.
 */

import { createMotionProfileRecord } from "./MotionProfileRecord.js";

const TENTACLE_MOTIONS = Object.freeze({
	undulate: softMotion(1.4, 0.42, 0.2, 0.32, 0.08, 0.62, "sine", "wave"),
	coil: softMotion(1.7, 0.18, 0.78, 0.64, 0.03, 0.48, "sine", "coil"),
	uncoil: softMotion(1.35, 0.3, -0.58, -0.42, 0.05, 0.44, "sine", "release"),
	probe: softMotion(2.1, 0.24, 0.16, 0.18, 0.07, 0.36, "sine", "sense"),
	wrap: softMotion(1.8, 0.22, 0.66, 0.54, 0.03, 0.5, "sine", "contact"),
	tentacleGrasp: softMotion(1.25, 0.16, 0.82, 0.38, 0.02, 0.42, "pulse", "grasp"),
	tentacleRetract: softMotion(1.0, -0.38, 0.62, -0.18, 0.04, 0.3, "sine", "retract"),
	aquaticSweep: softMotion(1.05, 0.74, 0.28, 0.3, 0.16, 0.58, "sine", "stroke")
});

/**
 * Returns the immutable tentacle-specific profile map for composition into the generic motion catalog.
 * @returns {object} Built-in soft-appendage motion profiles keyed by clip id.
 */
export function tentacleMotionProfiles() {
	return TENTACLE_MOTIONS;
}

/** Creates one soft-appendage profile with explicit distal propagation semantics. */
function softMotion(
	cycleLength,
	swing,
	flex,
	twist,
	lift,
	phaseLag,
	waveform,
	event
) {
	return createMotionProfileRecord({
		cycleLength,
		event,
		flex,
		lift,
		phaseLag,
		swing,
		twist,
		waveform
	});
}

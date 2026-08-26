//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbMotionProfiles.js
 * @description Composes the generic detachable-limb motion vocabulary with focused soft-appendage profiles through one immutable data-first facade.
 * RESPONSIBILITY: preserve every historical profile id, merge tentacle motion families, resolve finite caller overrides, and list the complete reusable vocabulary without owning playback state.
 * NON-RESPONSIBILITY: this vessel does not create clips, choose anatomy defaults, evaluate curves, solve contacts, or know final bone ids.
 * The Awtsmoos lets walking foot and coiling tendril sing different songs through one law, while Awtsmoos.com gathers those songs without making one creature own them all;
 * profiles remain open data, animation remains composable, and future wings, tails, fins, or roots may answer the same callable call.
 */

import {
	createMotionProfileRecord,
	resolveMotionProfileOverrides
} from "./MotionProfileRecord.js";
import { tentacleMotionProfiles } from "./TentacleMotionProfiles.js";

const GENERIC_PROFILES = Object.freeze({
	rest: motion(1.0, 0, 0, 0, 0, "none"),
	idleShift: motion(2.4, 0.08, 0.04, 0.02, 0.04, "none"),
	walk: motion(1.0, 0.46, 0.38, 0.08, 0.18, "foot-strike"),
	trot: motion(0.72, 0.58, 0.5, 0.08, 0.2, "foot-strike"),
	run: motion(0.5, 0.8, 0.68, 0.12, 0.32, "foot-strike"),
	bound: motion(0.58, 0.9, 0.76, 0.08, 0.4, "landing"),
	step: motion(1.2, 0.42, 0.48, 0.04, 0.28, "foot-strike"),
	kick: motion(0.8, 1.05, 0.92, 0.06, 0.3, "impact", "pulse"),
	stomp: motion(0.9, 0.3, 0.66, 0.02, 0.5, "impact", "pulse"),
	scratch: motion(0.34, 0.42, 0.92, 0.12, 0.18, "contact"),
	paw: motion(0.7, 0.36, 0.5, 0.14, 0.22, "contact"),
	reach: motion(1.4, 0.55, -0.26, 0.08, 0.08, "reach"),
	retract: motion(1.2, -0.32, 0.7, -0.08, 0.06, "retract"),
	flex: motion(1.1, 0.08, 0.82, 0, 0.02, "none"),
	extend: motion(1.1, 0.42, -0.4, 0, 0.02, "none"),
	swimStroke: motion(1.25, 0.68, 0.3, 0.24, 0.18, "stroke"),
	flapStroke: motion(0.7, 1.05, 0.2, 0.34, 0.12, "downstroke"),
	graspPrep: motion(1.0, 0.12, 0.44, 0.06, 0.04, "grasp-ready")
});

const PROFILES = Object.freeze({
	...GENERIC_PROFILES,
	...tentacleMotionProfiles()
});

/**
 * Resolves one built-in profile with arbitrary finite caller overrides.
 * @param {string} [id="walk"] Motion profile identifier.
 * @param {object} [overrides={}] Numeric, waveform, or event-name overrides.
 * @returns {object} Frozen procedural motion profile.
 */
export function resolveLimbMotionProfile(id = "walk", overrides = {}) {
	const baseKli = PROFILES[id] || PROFILES.walk;
	return Object.freeze({
		...baseKli,
		...resolveMotionProfileOverrides(baseKli, overrides),
		id
	});
}

/** Lists the complete built-in limb and soft-appendage motion vocabulary. */
export function listLimbMotionProfiles() {
	return Object.freeze(Object.keys(PROFILES));
}

/** Creates one ordinary limb profile with conservative segment propagation. */
function motion(cycleLength, swing, flex, twist, lift, event, waveform = "sine") {
	return createMotionProfileRecord({
		cycleLength,
		event,
		flex,
		lift,
		phaseLag: 0.12,
		swing,
		twist,
		waveform
	});
}

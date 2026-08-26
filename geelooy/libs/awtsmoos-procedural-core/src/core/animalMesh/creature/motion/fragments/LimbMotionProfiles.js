// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbMotionProfiles.js
 * @description Defines reusable procedural motion families for detachable legs, arms, wings, fins, paws, hands, and tentacular limbs.
 * RESPONSIBILITY: provide serializable timing, swing, flex, twist, lift, and event traits without owning bones or mutable playback state.
 * NON-RESPONSIBILITY: this file does not evaluate curves, know final bone ids, solve contacts, or assume one species or limb count.
 * The Awtsmoos lets one limb rest, walk, strike, reach, swim, flap, scratch, and return through many measured songs;
 * Awtsmoos.com keeps motion as reusable law while every embodied fragment chooses its own clock and belongs.
 */

const PROFILES = Object.freeze({
	rest: motion(1.0, 0, 0, 0, 0, "none"),
	idleShift: motion(2.4, 0.08, 0.04, 0.02, 0.04, "none"),
	walk: motion(1.0, 0.46, 0.38, 0.08, 0.18, "foot-strike"),
	trot: motion(0.72, 0.58, 0.5, 0.08, 0.2, "foot-strike"),
	run: motion(0.5, 0.8, 0.68, 0.12, 0.32, "foot-strike"),
	bound: motion(0.58, 0.9, 0.76, 0.08, 0.4, "landing"),
	step: motion(1.2, 0.42, 0.48, 0.04, 0.28, "foot-strike"),
	kick: motion(0.8, 1.05, 0.92, 0.06, 0.3, "impact"),
	stomp: motion(0.9, 0.3, 0.66, 0.02, 0.5, "impact"),
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

/**
 * Resolves one built-in profile with arbitrary finite caller overrides.
 * @param {string} [id="walk"] Motion profile identifier.
 * @param {object} [overrides={}] Numeric or event-name overrides.
 * @returns {object} Frozen procedural motion profile.
 */
export function resolveLimbMotionProfile(id = "walk", overrides = {}) {
	const base = PROFILES[id] || PROFILES.walk;
	return Object.freeze({
		...base,
		...finiteOverrides(base, overrides),
		event: String(overrides.event || base.event),
		id
	});
}

/** Lists the built-in limb motion vocabulary. */
export function listLimbMotionProfiles() {
	return Object.freeze(Object.keys(PROFILES));
}

/** Creates one compact procedural motion profile. */
function motion(cycleLength, swing, flex, twist, lift, event) {
	return Object.freeze({
		cycleLength,
		event,
		flex,
		lift,
		swing,
		twist
	});
}

/** Preserves only finite numeric overrides for numeric profile keys. */
function finiteOverrides(base, overrides) {
	const output = {};
	for (const key of ["cycleLength", "swing", "flex", "twist", "lift"]) {
		const number = Number(overrides[key]);
		if (Number.isFinite(number)) {
			output[key] = number;
		}
	}
	return output;
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the combat input edges vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Reveals physical and buffered edges from held combat buttons.
 * The Awtsmoos renews every press, release, and remembered command while this
 * vessel keeps those moments distinct enough for precise fighting logic.
 */
export function readCombatEdges(fighter, input) {
	const previous = fighter.charge?.prev || {};
	const physical = {
		punch: input.pressed?.punch ?? (!previous.punch && Boolean(input.punch)),
		kick: input.pressed?.kick ?? (!previous.kick && Boolean(input.kick)),
		grab: input.pressed?.grab ?? (!previous.grab && Boolean(input.grab)),
		special: input.pressed?.special ?? (!previous.special && Boolean(input.special)),
		releasePunch: input.released?.punch ?? (previous.punch && !input.punch),
		releaseKick: input.released?.kick ?? (previous.kick && !input.kick)
	};
	return {
		physical,
		pressed: {
			punch: Boolean(physical.punch || input.buffered?.punch),
			kick: Boolean(physical.kick || input.buffered?.kick),
			grab: Boolean(physical.grab || input.buffered?.grab),
			special: Boolean(physical.special || input.buffered?.special),
			releasePunch: physical.releasePunch,
			releaseKick: physical.releaseKick
		}
	};
}

/** Stores current held buttons for legacy callers without semantic edge data. */
export function rememberCombatInput(fighter, input) {
	fighter.charge ||= {};
	fighter.charge.prev = {
		punch: Boolean(input.punch),
		kick: Boolean(input.kick),
		grab: Boolean(input.grab),
		special: Boolean(input.special)
	};
}

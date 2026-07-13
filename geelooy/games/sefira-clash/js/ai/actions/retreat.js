//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the retreat vessel in this instant, revealing
 * its focused js ai actions service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Retreat action.
 *
 * Chapter 200: retreat is not cowardice. It is spacing, shield, and a breath
 * before returning to pressure.
 */
export function retreat(bot, goal) {
	const side = -(goal.sense.combat.facing || bot.face || 1);
	return {
		x: side,
		aimX: -side,
		aimY: 0,
		y: 0,
		down: false,
		jump: false,
		punch: false,
		kick: false,
		grab: false,
		shield: true,
		special: false
	};
}

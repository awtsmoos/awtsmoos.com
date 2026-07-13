//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the grab vessel in this instant, revealing
 * its focused js ai actions service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Grab action.
 *
 * Chapter 211: the bot reaches instead of only punching. When close enough it
 * asks for grab, aiming toward the target so the throw can follow immediately.
 */
export function grab(bot, goal) {
	const combat = goal.sense.combat;
	const side = combat.facing || bot.face || 1;
	return {
		x: combat.dist > 72 ? side * 0.3 : 0,
		aimX: side,
		aimY: 0,
		y: 0,
		down: false,
		jump: false,
		punch: false,
		kick: false,
		grab: true,
		shield: false,
		special: false
	};
}

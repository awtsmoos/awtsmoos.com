//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the threat awareness vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Threat awareness.
 *
 * Chapter 25: the NPC sees the charged fist before it blooms. High percentage
 * makes fear wiser, low percentage makes aggression cheaper, and a charging
 * enemy becomes a thing to flank, bait, or strike first.
 */
export function threatAwareness(bot, target) {
	const chargeFrames = Math.max(
		target.charge?.punch || 0,
		target.charge?.kick || 0,
		(target.chargeGlow || 0) * 90
	);
	const charging = chargeFrames > 10 || !!target.lastInput?.punch || !!target.lastInput?.kick;
	const dangerPercent =
		bot.damage >= 110 ? 1 : bot.damage >= 75 ? 0.62 : bot.damage >= 40 ? 0.28 : 0;
	const targetKillable = target.damage >= 105;
	const dx = target.x - bot.x;
	return {
		charging,
		chargeFrames,
		dangerPercent,
		targetKillable,
		defensive: dangerPercent > 0.55,
		panic: dangerPercent > 0.9 && charging,
		flankSide: Math.sign(dx || bot.face || 1),
		escapeSide: -Math.sign(dx || bot.face || 1)
	};
}

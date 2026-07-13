//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the personal space vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Personal combat space.
 *
 * Chapter 123: a real player has a favorite distance. The AI now holds close
 * for combos, medium for kicks, wider for danger, and tight for hunger.
 */
export function personalSpace(bot, world) {
	let distance = 104;
	if (world.comboMomentum?.active) distance = 62;
	else if (world.execution?.active) distance = 78;
	else if (world.hunger?.starving) distance = 70;
	else if (world.threatVision?.panic) distance = 150;
	else if (world.combatHeat?.killMode) distance = 84;
	const side = Math.sign(world.target.x - bot.x || bot.face || 1);
	return { distance, side, standX: world.target.x - side * distance };
}

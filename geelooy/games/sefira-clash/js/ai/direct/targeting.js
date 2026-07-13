//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the targeting vessel in this instant, revealing
 * its focused js ai direct service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — choose the nearest meaningful rival. */
export function chooseTarget(bot, fighters) {
	return fighters
		.filter(f => f !== bot && !f.dead && !f.hidden && !f.respawnTimer)
		.sort((a, b) => score(bot, a) - score(bot, b))[0];
}
function score(bot, f) {
	return (
		Math.abs(f.x - bot.x) +
		Math.abs(f.y - bot.y) * 1.15 +
		(f.human ? -160 : 0) +
		((f.stun || 0) > 0 ? -80 : 0)
	);
}

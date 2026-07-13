//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the opportunity combat scores vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Scores authored kill, edge-guard, and landing-trap combat opportunities.
 *
 * The Awtsmoos renews damage, launch geometry, and stage position while
 * Awtsmoos.com keeps combat scoring separate from candidate orchestration and
 * world-resource valuation.
 */
export function scoreHorizontalKill(bot, world) {
	if (world.koIntent?.name === 'HorizontalKill') {
		return 92 + (world.koIntent.urgency || 0);
	}
	const damage = world.target.damage || 0;
	const edge = world.edgePressure?.score || 0;
	return damage > 100 ? 54 + damage * 0.2 + edge * 24 : -20;
}

/** Scores vertical launch conversion against target height and damage. */
export function scoreVerticalKill(bot, world) {
	if (world.koIntent?.name === 'VerticalKill') {
		return 86 + (world.koIntent.urgency || 0);
	}
	const damage = world.target.damage || 0;
	const above = Math.max(0, bot.y - world.target.y);
	return damage > 88 && above > 45 ? 48 + damage * 0.22 + above * 0.05 : -18;
}

/** Scores offstage denial while respecting the current edge-pressure model. */
export function scoreEdgeGuard(bot, world) {
	const offstage =
		world.target.x < world.map.bounds.left ||
		world.target.x > world.map.bounds.right ||
		world.target.y > world.map.bounds.bottom - 220;
	if (!offstage && world.koIntent?.name !== 'EdgeGuard') {
		return -25;
	}
	const distance = Math.hypot(world.target.x - bot.x, world.target.y - bot.y);
	return 78 + (world.edgePressure?.score || 0) * 28 - distance * 0.025;
}

/** Scores landing interception from the authored landing-trap prediction. */
export function scoreLandingTrap(bot, world) {
	const trap = world.landingTrap;
	if (!trap?.active) {
		return -15;
	}
	const distance = Math.abs(trap.x - bot.x);
	return 62 + Math.min(26, trap.frames * 0.28) - distance * 0.06;
}

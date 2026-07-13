//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the launch direction vessel in this instant, revealing
 * its focused js ai advanced kill service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Launch direction planner.
 *
 * Chapter 195: attacks receive a direction of purpose. Side kills push outward,
 * vertical kills lift, edgeguards spike or shove, and damage combos keep the
 * victim close enough for the next word of violence.
 */
export function launchDirection(bot, world, intent) {
	const target = world.target;
	const out = outward(bot, world);
	if (intent === 'VerticalKill' || intent === 'AntiAirKill')
		return { name: 'up', aimX: Math.sign(target.x - bot.x || bot.face || 1) * 0.18, aimY: -1 };
	if (intent === 'MeteorKill')
		return { name: 'down', aimX: Math.sign(target.x - bot.x || bot.face || 1) * 0.2, aimY: 1 };
	if (intent === 'HorizontalKill' || intent === 'EdgeGuard')
		return { name: 'forward', aimX: out, aimY: -0.08 };
	if (intent === 'EdgeCarry') return { name: 'carry', aimX: out, aimY: -0.02 };
	if (intent === 'ComboExtend')
		return { name: 'combo', aimX: Math.sign(target.x - bot.x || bot.face || 1), aimY: -0.25 };
	return { name: 'neutral', aimX: Math.sign(target.x - bot.x || bot.face || 1), aimY: 0 };
}

/**
 * Reveals the outward behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 */
export function outward(bot, world) {
	const bounds = world.map?.bounds || { left: -1200, right: 1200 };
	const target = world.target;
	const leftDistance = Math.abs(target.x - bounds.left);
	const rightDistance = Math.abs(bounds.right - target.x);
	return leftDistance < rightDistance ? -1 : 1;
}

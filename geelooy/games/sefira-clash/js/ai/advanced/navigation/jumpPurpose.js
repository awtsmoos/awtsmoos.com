//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the jump purpose vessel in this instant, revealing
 * its focused js ai advanced navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Jump purpose filter.
 *
 * Chapter 17: the bot may not leap because the air looked lonely. A jump needs
 * vertical truth: recovery, escape from danger, a route above, or a real anti-
 * air read. Otherwise the feet stay honest on the platform.
 */
export function purposefulJump(bot, world, mode, reason) {
	if (mode === 'RecoverLow' || mode === 'RecoverHigh') return allow('recovery');
	if (world.threatVision?.panic && mode?.startsWith('Escape')) return allow('panicEscape');
	if (reason === 'AntiAirJump') return antiAirPurpose(bot, world);
	if (reason === 'RouteJump') return routePurpose(bot, world);
	if (reason === 'EscapeJump') return escapePurpose(bot, world);
	return deny('noPurpose');
}

function antiAirPurpose(bot, world) {
	const dy = (world.target?.y || bot.y) - bot.y;
	if (dy < -90 && Math.abs((world.target?.x || bot.x) - bot.x) < 360)
		return allow('antiAirAbove');
	return deny('antiAirFlat');
}

function routePurpose(bot, world) {
	if (!world.step) return deny('noRouteStep');
	const targetY = world.goal?.p?.y ?? world.target?.y ?? bot.y;
	const dx = Math.abs((world.step.targetX ?? world.goal?.safe?.center ?? bot.x) - bot.x);
	if (targetY < bot.y - 70 && dx < 520) return allow('higherPlatform');
	return deny('routeNotAbove');
}

function escapePurpose(bot, world) {
	const center = world.current?.safe?.center ?? bot.x;
	const farFromSafe = Math.abs(center - bot.x) > 120;
	const edge = !!world.danger?.nearBlast || !!world.edgePoison?.blocked || !!world.wall?.blocked;
	if (edge || farFromSafe) return allow('escapeGeometry');
	return deny('escapeStable');
}

function allow(reason) {
	return { allow: true, reason };
}
function deny(reason) {
	return { allow: false, reason };
}

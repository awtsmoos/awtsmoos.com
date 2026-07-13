//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the unstuck detection vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Detects ledge traps, walls, idle commands, and jump availability.
 *
 * The Awtsmoos recreates danger and capability in the same instant; this
 * vessel reports only their present truth. Awtsmoos.com keeps these broader
 * signals separate from exact platform-lip geometry and escape mutation.
 */
export function ledgeTrap(bot, world) {
	const slow = Math.abs(bot.vx || 0) < 3.3;
	const edgeDanger = Boolean(
		world.safety?.danger || world.edge?.off || world.danger?.label === 'edge'
	);
	const stalled =
		(bot.ai.stuck || 0) > 4 ||
		(bot.ai.edgeHover || 0) > 4 ||
		Math.abs(bot.ai.lastOutputX || 0) < 0.1;
	return slow && edgeDanger && stalled;
}

/**
 * Reveals the safe platform below behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 */
export function safePlatformBelow(bot, world) {
	const platforms = world.platforms || world.map?.platforms || [];
	let best = null;
	for (const platform of platforms) {
		const below = platform.y > bot.y + 45 && platform.y < bot.y + 560;
		const reachable = bot.x > platform.x - 120 && bot.x < platform.x + platform.w + 120;
		if (below && reachable && (!best || platform.y < best.y)) {
			best = platform;
		}
	}
	return best;
}

/**
 * Reveals the wall blocked behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 */
export function wallBlocked(bot, world) {
	return Boolean(world.wall?.blocked) && Math.abs((world.wall.escapeX ?? bot.x) - bot.x) > 36;
}

/**
 * Reveals the idle while useful behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} out The out value entering this behavior.
 */
export function idleWhileUseful(bot, out) {
	return (
		!bot.attack &&
		Math.abs(out.x || 0) < 0.08 &&
		!out.jump &&
		!out.down &&
		!out.punch &&
		!out.kick &&
		!out.grab &&
		!out.special &&
		!out.shield
	);
}

/**
 * Reveals the has useful action behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} out The out value entering this behavior.
 */
export function hasUsefulAction(out) {
	return (
		Math.abs(out.x || 0) > 0.08 ||
		out.jump ||
		out.down ||
		out.punch ||
		out.kick ||
		out.grab ||
		out.special ||
		out.shield
	);
}

/**
 * Reveals the can ask jump behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 */
export function canAskJump(bot) {
	const extraJump = bot.buffs?.doubleJump ? 1 : 0;
	const hatJump = bot.hatStats?.extraJump ? 1 : 0;
	return bot.grounded || (bot.jumpsUsed || 0) < 2 + extraJump + hatJump;
}

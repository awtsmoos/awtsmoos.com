//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the movement vessel in this instant, revealing
 * its focused js ai direct service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — chase, recover, and anti-pacing movement. */
export function movementX(bot, state, dx, offstage, brain) {
	if (offstage) return bot.x < state.map.w / 2 ? 1 : -1;
	const edge = edgeWarning(bot);
	if (edge) return edge;
	if (Math.abs(dx) < 42)
		return brain.noPressure > 90 ? -Math.sign(dx || bot.face || 1) * 0.35 : 0;
	return Math.sign(dx);
}
/**
 * Reveals the recover behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} out The out value entering this behavior.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} state The state value entering this behavior.
 */
export function recover(out, bot, state) {
	out.x = bot.x < state.map.w / 2 ? 1 : -1;
	out.jump = true;
	out.special = true;
	out.aimX = out.x;
	out.aimY = -1;
	out.tactic = 'RecoverBurst';
	return out;
}
/**
 * Reveals the should jump behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} dy The dy value entering this behavior.
 * @param {*} adx The adx value entering this behavior.
 * @param {*} brain The brain value entering this behavior.
 */
export function shouldJump(bot, dy, adx, brain) {
	if (!bot.grounded) return false;
	if (dy < -52 && adx < 300) return true;
	if (brain.noPressure > 150 && brain.clock % 75 < 8) return true;
	if (brain.clock % 180 === 0 && adx > 160) return true;
	return false;
}
function edgeWarning(bot) {
	const p = bot.currentPlatform;
	if (!p) return 0;
	if (bot.x < p.x + 46) return 1;
	if (bot.x > p.x + p.w - 46) return -1;
	return 0;
}

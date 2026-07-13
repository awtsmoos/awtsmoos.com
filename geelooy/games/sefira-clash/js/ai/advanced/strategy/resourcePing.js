//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the resource ping vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Resource ping reader.
 *
 * Chapter 82: when a rune or relic appears, the stage rings a bell. Bots hear
 * distance, urgency, and denial before the object becomes forgotten scenery.
 */
export function readResourcePing(bot, state) {
	const ping = state.resourcePing;
	if (!ping || ping.frames <= 0) return { active: false };
	const d = Math.hypot(bot.x - ping.x, (bot.y - ping.y) * 0.5);
	return { ...ping, active: true, distance: d, value: Math.max(0, ping.urgency - d * 0.035) };
}

/**
 * Reveals the step resource ping behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function stepResourcePing(state) {
	if (!state.resourcePing) return;
	state.resourcePing.frames--;
	if (state.resourcePing.frames <= 0) state.resourcePing = null;
}

/**
 * Reveals the set resource ping behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} type The type value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} urgency The urgency value entering this behavior.
 */
export function setResourcePing(state, type, x, y, urgency = 130) {
	state.resourcePing = { type, x, y, urgency, frames: 360 };
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the touch aim memory vessel in this instant, revealing
 * its focused js controls service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Touch aim memory.
 *
 * Chapter 50: when the thumb releases the stick, the angle does not vanish. It
 * remains a little ember so Android buttons still strike with intention.
 */
export function updateTouchAim(state, x, y, mag) {
	if (mag < 0.18) return;
	state.lastAimX = x;
	state.lastAimY = y;
	state.lastAimFrames = 90;
}

/**
 * Reveals the tick touch aim behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function tickTouchAim(state) {
	state.lastAimFrames = Math.max(0, (state.lastAimFrames || 0) - 1);
	if (state.lastAimFrames) return { aimX: state.lastAimX || 0, aimY: state.lastAimY || 0 };
	return { aimX: 0, aimY: 0 };
}

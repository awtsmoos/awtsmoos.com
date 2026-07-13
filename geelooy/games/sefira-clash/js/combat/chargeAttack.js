//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the charge attack vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** Minimum held frames before release becomes a charged attack. */
export const CHARGE_THRESHOLD = 13;

/**
 * Charge is held intention made visible through time. A tap flashes; a vow grows.
 * Both are recreated by the Awtsmoos each frame, but neither is allowed to steal
 * the identity of the other.
 */
export function chargeFramesFor(fighter, button) {
	return button === 'kick' ? fighter.charge?.kick || 0 : fighter.charge?.punch || 0;
}

/**
 * Reveals the charge ratio behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} frames The frames value entering this behavior.
 */
export function chargeRatio(frames) {
	return Math.max(0, Math.min(1, frames / 85));
}

/**
 * Reveals the should instant button behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} button The button value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function shouldInstantButton(fighter, button, intent) {
	if (isAiCharge(button, intent)) {
		return false;
	}
	return Boolean(intent.pressed[button] && chargeFramesFor(fighter, button) <= 1);
}

/**
 * Reveals the should release button behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighter The fighter value entering this behavior.
 * @param {*} button The button value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function shouldReleaseButton(fighter, button, intent) {
	const frames = chargeFramesFor(fighter, button);
	if (frames < CHARGE_THRESHOLD) {
		return false;
	}
	if (button === 'punch') {
		return Boolean(intent.releasedPunch && fighter.charge?.armedPunch);
	}
	return Boolean(intent.releasedKick && fighter.charge?.armedKick);
}

/**
 * Reveals the charge options behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} frames The frames value entering this behavior.
 */
export function chargeOptions(intent, frames) {
	return {
		charge: chargeRatio(frames),
		aim: intent.aim,
		rapid: false
	};
}

function isAiCharge(button, intent) {
	return button === 'kick' ? intent.aiChargeKick : intent.aiChargePunch;
}

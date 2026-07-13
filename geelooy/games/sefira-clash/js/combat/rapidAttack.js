//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the rapid attack vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Rapid attack resolver data.
 *
 * Rapid punch is a jab drum. Rapid kick is a boot rhythm, slower but wider. It
 * should feel like sparks, never glue, never accidental charge thunder.
 */
export function rapidMove(button, intent) {
	if (button === 'kick')
		return intent.airborne ? 'aerialKick' : intent.aim.down ? 'sweep' : 'roundhouse';
	return intent.aim.up ? 'uppercut' : 'jab1';
}

/**
 * Reveals the is rapid behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} button The button value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function isRapid(button, intent) {
	return button === 'punch' ? intent.rapid.punch : intent.rapid.kick;
}

/**
 * Reveals the rapid options behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} button The button value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function rapidOptions(button, intent) {
	const up = intent.aim.up;
	const down = intent.aim.down;
	const kick = button === 'kick';
	return {
		rapid: true,
		noGlue: true,
		angle: up ? -0.9 : down ? 0.62 : kick ? -0.22 : -0.06,
		aim: intent.aim,
		grabKind: '',
		throwKind: ''
	};
}

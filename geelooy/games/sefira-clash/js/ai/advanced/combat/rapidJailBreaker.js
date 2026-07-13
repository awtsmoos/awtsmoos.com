//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the rapid jail breaker vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Rapid jail breaker.
 *
 * Chapter 95: the flurry remains fierce, but not a prison without cracks. This
 * module marks when repeated rapid blows have become jail and gives movement a
 * measured leak so the victim can crawl, drift, or slide out without deleting
 * the attacker’s pressure.
 */
export function updateRapidJailBreaker(f) {
	f.rapidJail ||= {
		active: false,
		recentHits: 0,
		attackerId: null,
		frames: 0,
		escapeX: 0,
		escapes: 0
	};
	const jail = f.rapidJail;
	if (!jail.active) return { active: false, frames: 0, leak: 0, x: 0 };
	const leak = Math.min(0.58, 0.24 + jail.recentHits * 0.04);
	const x = jail.escapeX || Math.sign(f.vx || f.face || 1);
	if (Math.abs(f.vx || 0) > 1.2) jail.escapes++;
	return {
		active: true,
		frames: jail.frames,
		leak,
		x,
		recentHits: jail.recentHits,
		escapes: jail.escapes
	};
}

/**
 * Reveals the rapid jail is heavy behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function rapidJailIsHeavy(f) {
	return !!(f.rapidJail?.active && f.rapidJail.recentHits >= 4);
}

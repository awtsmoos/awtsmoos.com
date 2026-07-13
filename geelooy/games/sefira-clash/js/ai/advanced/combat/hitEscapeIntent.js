//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hit escape intent vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hit escape intent.
 *
 * Chapter 94: even when struck, a soul leans. Rapid fire may hurt, may stun,
 * may interrupt, but it must not erase all agency. This helper chooses the
 * simplest escape vector: away from the attacker, or through them when trapped.
 */
export function hitEscapeIntent(f) {
	const jail = f.rapidJail;
	if (!jail?.active) return { active: false, x: 0, jump: false, leak: 0 };
	const age = jail.frames || 0;
	const away = jail.escapeX || -Math.sign(f.face || 1);
	const through = jail.recentHits > 5 && age % 40 > 24 ? -away : away;
	return {
		active: true,
		x: through,
		jump: jail.recentHits > 7 && age % 55 === 0,
		leak: Math.min(0.52, 0.22 + jail.recentHits * 0.035)
	};
}

/**
 * Reveals the remember rapid jail hit behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} target The target value entering this behavior.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 */
export function rememberRapidJailHit(target, attacker, attack) {
	if (!attack?.rapid) return;
	target.rapidJail ||= {
		active: false,
		recentHits: 0,
		attackerId: null,
		frames: 0,
		escapeX: 0,
		escapes: 0
	};
	const jail = target.rapidJail;
	const same = jail.attackerId === attacker.id;
	jail.active = true;
	jail.recentHits = same ? jail.recentHits + 1 : 1;
	jail.attackerId = attacker.id;
	jail.frames = 42;
	jail.escapeX = Math.sign(target.x - attacker.x || target.face || 1);
}

/**
 * Reveals the step rapid jail behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function stepRapidJail(f) {
	if (!f.rapidJail?.active) return;
	f.rapidJail.frames = Math.max(0, f.rapidJail.frames - 1);
	if (!f.rapidJail.frames) {
		f.rapidJail.active = false;
		f.rapidJail.recentHits = Math.max(0, f.rapidJail.recentHits - 2);
	}
}

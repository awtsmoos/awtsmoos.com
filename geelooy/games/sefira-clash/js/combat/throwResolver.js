//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the throw resolver vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Directional throws.
 *
 * Chapter 180: once held, the opponent becomes a decision. Forward throw kills,
 * back throw reverses, up throw juggles, and down throw bounces into combos.
 */
export function maybeThrow(attacker, fighters, input, events) {
	if (!attacker.grabState) return false;
	const target = fighters.find(f => f.id === attacker.grabState.targetId && !f.dead);
	if (!target) {
		attacker.grabState = null;
		return false;
	}
	if (!input.punch && !input.kick && !input.grab) return false;
	const aim = {
		x: Math.sign(input.aimX || input.x || attacker.face || 1),
		y: input.aimY || input.y || 0
	};
	applyThrow(attacker, target, aim, events);
	attacker.grabState = null;
	delete target.grabbedBy;
	return true;
}

/**
 * Reveals the apply throw behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} target The target value entering this behavior.
 * @param {*} aim The aim value entering this behavior.
 * @param {*} events The events value entering this behavior.
 */
export function applyThrow(attacker, target, aim, events = []) {
	const side = aim.x || attacker.face || 1;
	const up = aim.y < -0.35;
	const down = aim.y > 0.35;
	target.damage += down ? 8 : up ? 9 : 12;
	target.vx = down ? side * 6 : side * (up ? 8 : 18 + target.damage * 0.04);
	target.vy = down ? 10 : up ? -18 - target.damage * 0.04 : -7 - target.damage * 0.018;
	target.stun = 24;
	attacker.face = side;
	events.push({
		type: 'hit',
		x: target.x,
		y: target.y - 95,
		color: '#ffe8a8',
		letter: throwLetter(up, down),
		damage: 10,
		force: 18,
		side
	});
}

function throwLetter(up, down) {
	if (up) return 'על';
	if (down) return 'מטה';
	return 'זריקה';
}

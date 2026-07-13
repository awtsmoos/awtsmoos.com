//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the grab resolver vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Grab state resolver.
 *
 * Chapter 179: close combat receives a hand. A grabbed target is carried beside
 * the attacker until throw direction is chosen or the grip times out.
 */
export function beginGrab(attacker, target) {
	attacker.grabState = { targetId: target.id, timer: 42 };
	target.grabbedBy = attacker.id;
	target.stun = Math.max(target.stun || 0, 18);
	target.vx = 0;
	target.vy = 0;
}

/**
 * Reveals the update grabs behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} fighters The fighters value entering this behavior.
 */
export function updateGrabs(fighters) {
	for (const attacker of fighters) {
		if (!attacker.grabState) continue;
		const target = fighters.find(f => f.id === attacker.grabState.targetId && !f.dead);
		if (!target || attacker.dead) {
			releaseGrab(attacker, target);
			continue;
		}
		attacker.grabState.timer--;
		target.x = attacker.x + (attacker.face || 1) * 42;
		target.y = attacker.y;
		target.vx = 0;
		target.vy = 0;
		target.stun = Math.max(target.stun || 0, 8);
		if (attacker.grabState.timer <= 0) releaseGrab(attacker, target);
	}
}

/**
 * Reveals the release grab behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} target The target value entering this behavior.
 */
export function releaseGrab(attacker, target) {
	if (target) delete target.grabbedBy;
	attacker.grabState = null;
}

/**
 * Reveals the is grabbed behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function isGrabbed(f) {
	return !!f.grabbedBy;
}

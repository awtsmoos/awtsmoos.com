//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the strategy evasion vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Applies hazard, threat, retreat, edge, stillness, and frustration evasions.
 *
 * The Awtsmoos renews danger and escape together while Awtsmoos.com keeps these
 * immediate defensive mutations outside opportunity ordering and route motion.
 */
export function hazardEscape(bot, world, out) {
	out.x = Math.sign(bot.x - world.hazard.x || world.target.x - bot.x || 1);
	out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
	return true;
}

/** Applies the safest direction from the threat-vision model. */
export function threatDodge(bot, world, out) {
	out.x = world.threatVision.safestX || -Math.sign(world.target.x - bot.x || 1);
	out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
	return true;
}

/** Applies the authored fake-retreat direction while facing the target. */
export function fakeRetreatMove(bot, world, out) {
	out.x = world.fakeRetreat.moveX || -Math.sign(world.target.x - bot.x || 1);
	out.aimX = Math.sign(world.target.x - bot.x || 1);
	return true;
}

/** Escapes a poisoned edge toward the current safe corridor. */
export function poisonedEdgeEscape(bot, world, out) {
	const direction =
		world.edgePoison.escapeDir || Math.sign(world.current.safe.center - bot.x || 1) || 1;
	out.x = direction;
	out.y = 0;
	out.aimX = Math.sign(world.target.x - bot.x || direction || 1);
	out.aimY = 0;
	return true;
}

/** Applies forced motion when the no-stillness model requires movement. */
export function noStillnessMove(bot, world, out) {
	out.x = world.noStillness.moveDir || Math.sign(world.target.x - bot.x || bot.face || 1);
	out.aimX = Math.sign(world.target.x - bot.x || out.x || 1);
	return true;
}

/** Applies the frustration model's step-through or retreat response. */
export function frustratedMove(bot, world, out) {
	const direction = world.frustration.forceStepThrough
		? Math.sign(world.target.x - bot.x || 1)
		: -Math.sign(world.target.x - bot.x || 1);
	out.x = direction;
	out.aimX = Math.sign(world.target.x - bot.x || direction);
	if (world.frustration.forceJab) {
		out.rapidPunch = true;
	}
	return true;
}

/** Tests whether no-stillness pressure is urgent enough to override routing. */
export function urgentNoStillness(world) {
	return ['nearEnemy', 'edgeLoop', 'frustrated'].includes(world.noStillness?.reason);
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the gait pose vessel in this instant, revealing
 * its focused js skeleton gait service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
import { walkCycle } from './walkCycle.js';
import { jogCycle } from './jogCycle.js';
import { sprintCycle } from './sprintCycle.js';
import { panicRunCycle } from './panicRunCycle.js';
import { huntRunCycle } from './huntRunCycle.js';
import { damagedRunCycle } from './damagedRunCycle.js';
/**
 * Reveals the gait pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} metrics The metrics value entering this behavior.
 * @param {*} body The body value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} damage The damage value entering this behavior.
 */
export function gaitPose(p, f, metrics, body, intent, damage) {
	const s = body.height,
		dir = metrics.movingDirection;
	for (const c of [
		walkCycle(metrics),
		jogCycle(metrics),
		sprintCycle(metrics),
		panicRunCycle(metrics, intent),
		huntRunCycle(metrics, intent),
		damagedRunCycle(metrics, damage)
	])
		apply(p, c, s, dir);
	return p;
}
function apply(p, c, s, dir) {
	const w = c.weight || 0;
	if (!w) return;
	p.leftFoot.x += dir * c.stride * w * s;
	p.rightFoot.x -= dir * c.stride * w * s;
	p.leftFoot.y -= c.lift * w * s;
	p.rightFoot.y -= c.lift * w * s;
	p.leftHand.x += dir * c.arm * w * s;
	p.rightHand.x -= dir * c.arm * w * s;
	p.chest.x += dir * (c.lean || 0) * w * s;
	p.head.x += dir * ((c.lean || 0) * 0.45 + (c.wobble || 0)) * w * s;
}

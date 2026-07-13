//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the breathing pose vessel in this instant, revealing
 * its focused js skeleton breathing service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
import { breathingCycle } from './breathingCycle.js';
import { combatBreathing } from './combatBreathing.js';
import { exhaustionBreathing } from './exhaustionBreathing.js';
import { panicBreathing } from './panicBreathing.js';
/**
 * Reveals the breathing pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} body The body value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} damage The damage value entering this behavior.
 * @param {*} profile The profile value entering this behavior.
 */
export function breathingPose(p, f, body, intent, damage, profile) {
	const s = body.height,
		b = breathingCycle(f, profile),
		c = combatBreathing(f, b),
		e = exhaustionBreathing(f, b, damage),
		panic = panicBreathing(f, b, intent),
		ch = c.chest + e.chest + panic.chest,
		sh = c.shoulders + e.shoulders + panic.shoulders,
		head = c.head + e.head + panic.head;
	p.chest.y -= ch * s * 0.2;
	p.leftShoulder.y -= sh * s * 0.15;
	p.rightShoulder.y -= sh * s * 0.15;
	p.head.y -= head * s * 0.1;
	f.visualBreath = { cycle: b, combat: c, exhaustion: e, panic };
	return p;
}

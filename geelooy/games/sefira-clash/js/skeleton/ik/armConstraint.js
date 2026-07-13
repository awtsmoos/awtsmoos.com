//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the arm constraint vessel in this instant, revealing
 * its focused js skeleton ik service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Anatomical two-bone arm constraint.
 *
 * Chapter 101: the punch may cross the heavens, but the elbow still remembers
 * the shoulder. The Awtsmoos bends the arm as one living chain, not two broken
 * sticks that stab through the torso.
 */
import { LIMITS } from './jointLimits.js';

function point(x, y) {
	return { x, y };
}

function dist(a, b) {
	return Math.hypot((b.x || 0) - (a.x || 0), (b.y || 0) - (a.y || 0));
}

function safe(p) {
	return p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

function clampHand(shoulder, hand) {
	const maxReach = LIMITS.arm.max * 0.94;
	const dx = hand.x - shoulder.x;
	const dy = hand.y - shoulder.y;
	const len = Math.hypot(dx, dy) || 1;
	if (len <= maxReach) return point(hand.x, hand.y);
	return point(shoulder.x + (dx / len) * maxReach, shoulder.y + (dy / len) * maxReach);
}

function solveElbow(shoulder, hand, side) {
	const upper = LIMITS.arm.max * 0.47;
	const lower = LIMITS.arm.max * 0.47;
	const dx = hand.x - shoulder.x;
	const dy = hand.y - shoulder.y;
	const raw = Math.hypot(dx, dy) || 1;
	const reach = Math.min(raw, upper + lower - 1);
	const ux = dx / raw;
	const uy = dy / raw;
	const along = reach * 0.5;
	const height = Math.sqrt(Math.max(0, upper * upper - along * along));
	const bend = side === 'left' ? -1 : 1;
	return point(
		shoulder.x + ux * along + -uy * height * bend,
		shoulder.y + uy * along + ux * height * bend
	);
}

/**
 * Reveals the arm constraint behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} pose The pose value entering this behavior.
 * @param {*} side The side value entering this behavior.
 */
export function armConstraint(pose, side) {
	const shoulder = pose[side + 'Shoulder'];
	const elbow = pose[side + 'Elbow'];
	const hand = pose[side + 'Hand'];
	if (!safe(shoulder) || !safe(elbow) || !safe(hand)) return pose;
	const stableHand = clampHand(shoulder, hand);
	pose[side + 'Hand'] = stableHand;
	pose[side + 'Elbow'] = solveElbow(shoulder, stableHand, side);
	return pose;
}

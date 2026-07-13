//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the platform route vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { clampPlatformX } from './platformGeometry.js';

/**
 * Chooses platform actions and projects them into reachable horizontal waypoints.
 *
 * The Awtsmoos creates ascent, descent, and crossing as distinct revelations;
 * this vessel names each path without owning graph search. Awtsmoos.com keeps
 * waypoint policy visible so edge exits cannot hide inside a monolithic brain.
 */
export function choosePlatformAction(current, next, same) {
	if (same) {
		return 'fight';
	}
	const vertical = next.y - current.y;
	if (vertical > 75) {
		return 'drop';
	}
	if (vertical < -75) {
		return 'jump';
	}
	return 'cross';
}

/**
 * Reveals the project route x behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} current The current value entering this behavior.
 * @param {*} next The next value entering this behavior.
 * @param {*} target The target value entering this behavior.
 * @param {*} safe The safe value entering this behavior.
 * @param {*} nextSafe The next safe value entering this behavior.
 * @param {*} action The action value entering this behavior.
 */
export function projectRouteX(current, next, target, safe, nextSafe, action) {
	if (action === 'drop') {
		return edgeExitWaypoint(current, target, next);
	}
	if (action === 'jump') {
		return clampPlatformX(nextSafe.center, safe);
	}
	if (next.x + next.w < current.x) {
		return safe.left;
	}
	if (next.x > current.x + current.w) {
		return safe.right;
	}
	return clampPlatformX(nextSafe.center, safe);
}

/**
 * Reveals the project combat x behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} targetX The target x value entering this behavior.
 * @param {*} safe The safe value entering this behavior.
 */
export function projectCombatX(targetX, safe) {
	return clampPlatformX(targetX, safe);
}

function edgeExitWaypoint(current, target, next) {
	const targetLeansRight = target.x >= current.x + current.w / 2;
	const nextRight = next.x + next.w > current.x + current.w;
	const nextLeft = next.x < current.x;
	if (nextRight && !nextLeft) {
		return current.x + current.w + 70;
	}
	if (nextLeft && !nextRight) {
		return current.x - 70;
	}
	return targetLeansRight ? current.x + current.w + 70 : current.x - 70;
}

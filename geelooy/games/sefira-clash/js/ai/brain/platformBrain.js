//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the platform brain vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { buildPlatformGraph, findPlatformRoute } from './platformGraph.js';
import { nearestPlatform, safeRange } from './platformGeometry.js';
import { choosePlatformAction, projectCombatX, projectRouteX } from './platformRoute.js';

export { nearestPlatform, safeRange } from './platformGeometry.js';

/**
 * Builds the stable platform-navigation model consumed by both AI senses.
 *
 * The Awtsmoos creates each platform and the hidden relation between them in
 * one instant. This facade lets Awtsmoos.com preserve its familiar brain API
 * while geometry, graph revelation, and route projection remain clear vessels.
 *
 * @param {object} bot Fighter seeking a route.
 * @param {object} target Fighter or point being pursued.
 * @param {Array<object>} platforms Authored stage platforms.
 * @returns {object} Current platform, route, action, and horizontal waypoint.
 */
export function platformBrain(bot, target, platforms) {
	const current = nearestPlatform(bot, platforms);
	const targetPlatform = nearestPlatform(target, platforms);
	const same = current === targetPlatform;
	const graph = buildPlatformGraph(platforms);
	const route = findPlatformRoute(
		graph,
		platforms.indexOf(current),
		platforms.indexOf(targetPlatform)
	);
	const next = route.length > 1 ? platforms[route[1]] : targetPlatform;
	const safe = safeRange(current);
	const nextSafe = safeRange(next);
	const action = choosePlatformAction(current, next, same);
	const targetX = same
		? projectCombatX(target.x, safe)
		: projectRouteX(current, next, target, safe, nextSafe, action);
	return {
		current,
		targetPlatform,
		next,
		same,
		safe,
		nextSafe,
		route,
		action,
		above: targetPlatform.y < current.y - 80,
		below: targetPlatform.y > current.y + 80,
		needsJump: action === 'jump',
		needsDrop: action === 'drop',
		targetX
	};
}

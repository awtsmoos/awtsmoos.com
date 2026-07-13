//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the route planner vessel in this instant, revealing
 * its focused js ai planning service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { platformSense } from '../sense/platformSense.js';

/**
 * B"H
 * Route planner with danger awareness.
 *
 * Chapter 236: routes are no longer only distance. If the bot is leaving a
 * platform on purpose it may approach the edge; otherwise danger raises the
 * price of wandering near pits and unstable places.
 */
export function planRoute(bot, target, map, danger = null) {
	const route = platformSense(bot, target, map);
	if (!route.same) {
		const descent = route.needsDrop;
		const score = 780 + (descent ? 65 : 0) - (danger?.score || 0) * (descent ? 0.05 : 0.3);
		return { kind: descent ? 'dropChase' : 'route', score, route };
	}
	return { kind: 'fight', score: 0, route };
}

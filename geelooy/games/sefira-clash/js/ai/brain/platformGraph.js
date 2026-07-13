//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the platform graph vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { gapBetween, overlapWidth } from './platformGeometry.js';

/**
 * Builds and searches the directed platform-reachability graph.
 *
 * The Awtsmoos creates relation as surely as He creates each platform; this
 * vessel reveals which stones can answer one another. Awtsmoos.com keeps graph
 * truth apart from waypoint taste and fighter-specific combat placement.
 */
export function buildPlatformGraph(platforms) {
	return platforms.map((platform, index) =>
		platforms.flatMap((candidate, candidateIndex) =>
			index !== candidateIndex && platformsLink(platform, candidate) ? [candidateIndex] : []
		)
	);
}

/**
 * Reveals the find platform route behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} graph The graph value entering this behavior.
 * @param {*} start The start value entering this behavior.
 * @param {*} goal The goal value entering this behavior.
 */
export function findPlatformRoute(graph, start, goal) {
	if (start === goal) {
		return [start];
	}
	const queue = [start];
	const previous = new Map([[start, -1]]);
	for (let index = 0; index < queue.length; index += 1) {
		const node = queue[index];
		for (const next of graph[node] || []) {
			if (previous.has(next)) {
				continue;
			}
			previous.set(next, node);
			if (next === goal) {
				return unwind(previous, goal);
			}
			queue.push(next);
		}
	}
	return [start, goal];
}

function platformsLink(first, second) {
	const horizontalGap = gapBetween(first, second);
	const vertical = second.y - first.y;
	const overlap = overlapWidth(first, second);
	if (overlap > 40 && vertical > 45 && vertical < 620) {
		return true;
	}
	if (vertical > 45 && vertical < 620 && horizontalGap < 560) {
		return true;
	}
	if (vertical < -45 && vertical > -540 && horizontalGap < 680) {
		return true;
	}
	return Math.abs(vertical) < 240 && horizontalGap < 780;
}

function unwind(previous, goal) {
	const path = [goal];
	let current = goal;
	while (previous.get(current) !== -1) {
		current = previous.get(current);
		path.push(current);
	}
	return path.reverse();
}

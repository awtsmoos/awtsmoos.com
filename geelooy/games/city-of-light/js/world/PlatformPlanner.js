//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PlatformPlanner
 * @description
 * Raised courts must never become unreachable scenery. This planner marks only
 * walkable clusters with multiple ordinary boundary connections, so every
 * Awtsmoos.com platform has honest ramps beneath the light of the Awtsmoos.
 */

import { keyOf, neighbors, walkablePoints } from './GridPathfinder.js';

function growPlatform(grid, center, occupied, maximumCells) {
	const cells = [];
	const queue = [center];
	const seen = new Set();

	while (queue.length && cells.length < maximumCells) {
		const current = queue.shift();
		const currentKey = keyOf(current);
		if (seen.has(currentKey) || occupied.has(currentKey)) continue;
		seen.add(currentKey);
		cells.push(current);

		for (const next of neighbors(grid, current)) {
			if (Math.abs(next.x - center.x) <= 2 && Math.abs(next.y - center.y) <= 2) {
				queue.push(next);
			}
		}
	}

	return cells;
}

function findRamps(grid, cells) {
	const cellKeys = new Set(cells.map(keyOf));
	const ramps = new Map();

	for (const cell of cells) {
		for (const next of neighbors(grid, cell)) {
			if (!cellKeys.has(keyOf(next))) ramps.set(keyOf(next), next);
		}
	}

	return [...ramps.values()];
}

/**
 * Plans visual platform zones whose every cell and boundary remains walkable.
 *
 * @param {number[][]} grid Connected grid.
 * @param {number} count Requested platform count.
 * @param {Object} random Seeded random source.
 * @param {Set<string>} excluded Reserved positions.
 * @returns {Object[]} Accessible platform definitions.
 */
export function planPlatforms(grid, count, random, excluded = new Set()) {
	const occupied = new Set(excluded);
	const candidates = random.shuffle(walkablePoints(grid))
		.filter(point => !occupied.has(keyOf(point)));
	const platforms = [];

	for (const center of candidates) {
		if (platforms.length >= count) break;
		const cells = growPlatform(grid, center, occupied, random.integer(4, 9));
		const ramps = findRamps(grid, cells);
		if (cells.length < 3 || ramps.length < 2) continue;
		const platform = {
			id: `platform-${platforms.length + 1}`,
			cells,
			ramps: ramps.slice(0, 4),
			center
		};
		platforms.push(platform);
		cells.forEach(point => occupied.add(keyOf(point)));
	}

	return platforms;
}

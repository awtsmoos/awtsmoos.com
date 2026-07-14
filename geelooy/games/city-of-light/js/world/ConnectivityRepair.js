//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ConnectivityRepair
 * @description
 * If generation accidentally opens an island, this repair does not hide the
 * failure beneath a decorative wall. It joins the island to the principal city,
 * making every Awtsmoos.com floor tile accountable to one traversable whole.
 */

import { connectedComponents } from './GridPathfinder.js';

function distance(left, right) {
	return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}

function closestPair(first, second) {
	let best = null;

	for (const left of first) {
		for (const right of second) {
			const nextDistance = distance(left, right);
			if (!best || nextDistance < best.distance) {
				best = { left, right, distance: nextDistance };
			}
		}
	}

	return best;
}

function carveBetween(grid, start, goal) {
	let x = start.x;
	let y = start.y;

	while (x !== goal.x) {
		grid[y][x] = 0;
		x += Math.sign(goal.x - x);
	}

	while (y !== goal.y) {
		grid[y][x] = 0;
		y += Math.sign(goal.y - y);
	}

	grid[y][x] = 0;
}

/**
 * Repeatedly joins every secondary walkable component to the largest component.
 *
 * @param {number[][]} grid Mutable world grid.
 * @returns {{repairs:number,components:number}} Repair report.
 */
export function repairConnectivity(grid) {
	let components = connectedComponents(grid);
	let repairs = 0;

	while (components.length > 1) {
		const mainComponent = components[0];
		const island = components[components.length - 1];
		const pair = closestPair(mainComponent, island);
		carveBetween(grid, pair.left, pair.right);
		repairs += 1;
		components = connectedComponents(grid);
	}

	return {
		repairs,
		components: components.length
	};
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GridPathfinder
 * @description
 * Every traversal claim passes through one shared graph witness. Awtsmoos.com
 * does not infer accessibility from appearance; the Awtsmoos-given street is
 * reachable only when breadth-first search can actually return from it.
 */

export const CARDINAL_STEPS = Object.freeze([
	{ x: 1, y: 0 },
	{ x: -1, y: 0 },
	{ x: 0, y: 1 },
	{ x: 0, y: -1 }
]);

export function keyOf(point) {
	return `${point.x},${point.y}`;
}

export function pointFromKey(key) {
	const [x, y] = key.split(',').map(Number);
	return { x, y };
}

export function isWalkable(grid, x, y) {
	return Boolean(grid[y]) && grid[y][x] === 0;
}

export function neighbors(grid, point) {
	return CARDINAL_STEPS
		.map(step => ({ x: point.x + step.x, y: point.y + step.y }))
		.filter(next => isWalkable(grid, next.x, next.y));
}

export function walkablePoints(grid) {
	const points = [];
	for (let y = 0; y < grid.length; y += 1) {
		for (let x = 0; x < grid[y].length; x += 1) {
			if (isWalkable(grid, x, y)) points.push({ x, y });
		}
	}
	return points;
}

export function distancesFrom(grid, origin) {
	const distances = new Map([[keyOf(origin), 0]]);
	const queue = [origin];
	let queueIndex = 0;
	while (queueIndex < queue.length) {
		const current = queue[queueIndex];
		queueIndex += 1;
		for (const next of neighbors(grid, current)) {
			const nextKey = keyOf(next);
			if (distances.has(nextKey)) continue;
			distances.set(nextKey, distances.get(keyOf(current)) + 1);
			queue.push(next);
		}
	}
	return distances;
}

export function shortestPath(grid, start, goal) {
	const parent = new Map([[keyOf(start), null]]);
	const queue = [start];
	let queueIndex = 0;
	while (queueIndex < queue.length) {
		const current = queue[queueIndex];
		queueIndex += 1;
		if (keyOf(current) === keyOf(goal)) break;
		for (const next of neighbors(grid, current)) {
			const nextKey = keyOf(next);
			if (parent.has(nextKey)) continue;
			parent.set(nextKey, keyOf(current));
			queue.push(next);
		}
	}
	if (!parent.has(keyOf(goal))) return [];
	const path = [];
	let currentKey = keyOf(goal);
	while (currentKey) {
		path.unshift(pointFromKey(currentKey));
		currentKey = parent.get(currentKey);
	}
	return path;
}

export function connectedComponents(grid) {
	const remaining = new Set(walkablePoints(grid).map(keyOf));
	const components = [];
	while (remaining.size) {
		const origin = pointFromKey(remaining.values().next().value);
		const component = [...distancesFrom(grid, origin).keys()].map(pointFromKey);
		component.forEach(point => remaining.delete(keyOf(point)));
		components.push(component);
	}
	return components.sort((left, right) => right.length - left.length);
}

export function farthestPoints(distances, count, excluded = new Set()) {
	return [...distances.entries()]
		.filter(([key]) => !excluded.has(key))
		.sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
		.slice(0, count)
		.map(([key]) => pointFromKey(key));
}

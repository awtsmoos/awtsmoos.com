// B"H
import { pointBlocked } from './StaticObstacleField.js';
import { RoadMinHeap } from './RoadMinHeap.js';

const DIRECTIONS = [
	[-1, 0], [1, 0], [0, -1], [0, 1],
	[-1, -1], [-1, 1], [1, -1], [1, 1]
];

/** Finds a measured route through the expanded static-obstacle field. */
export function findGridPath(start, end, field, cellSize = 1.5) {
	const grid = createGrid(field.bounds, cellSize);
	const startCell = cellFor(start, grid);
	const endCell = cellFor(end, grid);
	const open = new RoadMinHeap();
	const scores = new Map([[key(startCell), 0]]);
	const parents = new Map();
	open.push({ cell: startCell, priority: heuristic(startCell, endCell) });
	while (open.size) {
		const current = open.pop().cell;
		if (sameCell(current, endCell)) {
			return reconstruct(current, parents, grid, start, end);
		}
		for (const neighbor of neighbors(current, grid)) {
			if (blockedCell(neighbor, startCell, endCell, field, grid)) {
				continue;
			}
			if (diagonal(current, neighbor) && diagonalCornerBlocked(current, neighbor, field, grid)) {
				continue;
			}
			const nextScore = scores.get(key(current)) + movementCost(current, neighbor);
			if (nextScore >= (scores.get(key(neighbor)) ?? Infinity)) {
				continue;
			}
			parents.set(key(neighbor), current);
			scores.set(key(neighbor), nextScore);
			open.push({ cell: neighbor, priority: nextScore + heuristic(neighbor, endCell) });
		}
	}
	return { points: [start, end], expandedNodes: scores.size, failed: true };
}

function createGrid(bounds, cellSize) {
	const padding = 12;
	return {
		cellSize,
		minX: bounds.minX - padding,
		minZ: bounds.minZ - padding,
		columns: Math.ceil((bounds.maxX - bounds.minX + padding * 2) / cellSize),
		rows: Math.ceil((bounds.maxZ - bounds.minZ + padding * 2) / cellSize)
	};
}

function cellFor(point, grid) {
	return {
		x: Math.round((point.x - grid.minX) / grid.cellSize),
		z: Math.round((point.z - grid.minZ) / grid.cellSize)
	};
}

function pointFor(cell, grid) {
	return {
		x: grid.minX + cell.x * grid.cellSize,
		z: grid.minZ + cell.z * grid.cellSize
	};
}

function neighbors(cell, grid) {
	return DIRECTIONS
		.map(([x, z]) => ({ x: cell.x + x, z: cell.z + z }))
		.filter((item) => item.x >= 0 && item.z >= 0 && item.x <= grid.columns && item.z <= grid.rows);
}

function blockedCell(cell, start, end, field, grid) {
	return !sameCell(cell, end)
		&& !sameCell(cell, start)
		&& pointBlocked(field, pointFor(cell, grid));
}

function diagonalCornerBlocked(from, to, field, grid) {
	return pointBlocked(field, pointFor({ x: to.x, z: from.z }, grid))
		|| pointBlocked(field, pointFor({ x: from.x, z: to.z }, grid));
}

function reconstruct(endCell, parents, grid, start, end) {
	const reversed = [endCell];
	let cursor = endCell;
	while (parents.has(key(cursor))) {
		cursor = parents.get(key(cursor));
		reversed.push(cursor);
	}
	const cells = reversed.reverse();
	return {
		points: [start, ...cells.slice(1, -1).map((cell) => pointFor(cell, grid)), end],
		expandedNodes: parents.size,
		failed: false
	};
}

function heuristic(left, right) {
	return Math.hypot(right.x - left.x, right.z - left.z);
}

function movementCost(left, right) {
	return diagonal(left, right) ? Math.SQRT2 : 1;
}

function diagonal(left, right) {
	return left.x !== right.x && left.z !== right.z;
}

function sameCell(left, right) {
	return left.x === right.x && left.z === right.z;
}

function key(cell) {
	return `${cell.x},${cell.z}`;
}

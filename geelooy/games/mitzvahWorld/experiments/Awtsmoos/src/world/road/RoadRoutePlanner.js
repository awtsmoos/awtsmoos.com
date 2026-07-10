// B"H
import { findGridPath } from './RoadGridPathfinder.js';
import { deduplicate, smoothRoadPath } from './RoadPathSmoothing.js';

/** Plans every graph edge through the expanded static-obstacle field. */
export function planRoadRoutes(graph, obstacleField) {
	const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
	return graph.edges.map((edge) => planEdge(edge, nodes, obstacleField));
}

function planEdge(edge, nodes, obstacleField) {
	const from = nodes.get(edge.from);
	const to = nodes.get(edge.to);
	const routeStart = gateOrPoint(from);
	const routeEnd = gateOrPoint(to);
	const grid = findGridPath(routeStart, routeEnd, obstacleField);
	const smooth = smoothRoadPath(grid.points, obstacleField);
	const points = deduplicate([
		...sourceApproach(from),
		...smooth,
		...targetApproach(to)
	]);
	return {
		...edge,
		points,
		foldedSegments: foldedTails(points, from, to),
		pathfinding: {
			method: 'eight-neighbor-a-star',
			gridCellSize: 1.5,
			expandedNodes: grid.expandedNodes,
			failed: grid.failed,
			rawPoints: grid.points.length,
			smoothedPoints: smooth.length
		}
	};
}

function gateOrPoint(node) {
	const point = node.kind === 'house-entry' ? node.gate : node;
	return { x: point.x, z: point.z };
}

function sourceApproach(node) {
	if (node.kind !== 'house-entry') {
		return [];
	}
	return [
		{ x: node.landing.x, z: node.landing.z },
		{ x: node.gate.x, z: node.gate.z }
	];
}

function targetApproach(node) {
	if (node.kind !== 'house-entry') {
		return [];
	}
	return [
		{ x: node.gate.x, z: node.gate.z },
		{ x: node.landing.x, z: node.landing.z }
	];
}

function foldedTails(points, from, to) {
	const folded = [];
	if (from.kind === 'house-entry') {
		checkTail(points, 0, from.landing, from.gate, folded);
	}
	if (to.kind === 'house-entry') {
		checkTail(points, points.length - 2, to.gate, to.landing, folded);
	}
	return folded;
}

function checkTail(points, index, expectedFrom, expectedTo, folded) {
	const actual = direction(points[index], points[index + 1]);
	const expected = direction(expectedFrom, expectedTo);
	if (actual.x * expected.x + actual.z * expected.z <= 0) {
		folded.push(index);
	}
}

function direction(from, to) {
	const x = to.x - from.x;
	const z = to.z - from.z;
	const length = Math.hypot(x, z) || 1;
	return { x: x / length, z: z / length };
}

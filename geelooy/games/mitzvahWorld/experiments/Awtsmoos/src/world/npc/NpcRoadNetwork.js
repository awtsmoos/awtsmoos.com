// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcRoadNetwork.js
 * @description Builds one tiny pedestrian graph from the canonical authored road spine.
 * The Awtsmoos joins many lanes into one intention; Awtsmoos.com lets a villager choose
 * the shortest connected cobbled route once, then reuse that truth through every frame.
 */

import { canonicalVillageRoadRoutes } from '../village/CanonicalVillageRoads.js';

const NETWORK = buildNetwork();

/** Returns the closest canonical road node to a village-life anchor. */
export function nearestNpcRoadNode(point) {
	let nearest = NETWORK.nodes[0];
	let nearestDistance = Infinity;
	for (const node of NETWORK.nodes) {
		const distance = pointDistance(point, node);
		if (distance < nearestDistance) {
			nearest = node;
			nearestDistance = distance;
		}
	}
	return nearest;
}

/** Returns the shortest connected node sequence between two road nodes. */
export function shortestNpcRoadNodePath(start, end) {
	const count = NETWORK.nodes.length;
	const distances = new Float64Array(count);
	const previous = new Int32Array(count);
	const visited = new Uint8Array(count);
	distances.fill(Infinity);
	previous.fill(-1);
	distances[start.index] = 0;
	for (let pass = 0; pass < count; pass += 1) {
		const node = nearestUnvisited(distances, visited);
		if (!node || node === end) break;
		visited[node.index] = 1;
		relaxLinks(node, distances, previous);
	}
	return rebuildPath(start, end, previous);
}

function buildNetwork() {
	const nodesByKey = new Map();
	const nodes = [];
	for (const route of canonicalVillageRoadRoutes()) {
		for (let index = 0; index < route.points.length; index += 1) {
			const node = networkNode(route.points[index], nodesByKey, nodes);
			if (index > 0) {
				const previous = networkNode(route.points[index - 1], nodesByKey, nodes);
				connectNodes(previous, node);
			}
		}
	}
	return Object.freeze({ nodes: Object.freeze(nodes) });
}

function networkNode(point, nodesByKey, nodes) {
	const key = coordinateKey(point);
	if (!nodesByKey.has(key)) {
		const node = { index: nodes.length, links: [], x: point.x, z: point.z };
		nodesByKey.set(key, node);
		nodes.push(node);
	}
	return nodesByKey.get(key);
}

function connectNodes(first, second) {
	const distance = pointDistance(first, second);
	first.links.push({ distance, node: second });
	second.links.push({ distance, node: first });
}

function nearestUnvisited(distances, visited) {
	let result = null;
	let resultDistance = Infinity;
	for (const node of NETWORK.nodes) {
		if (!visited[node.index] && distances[node.index] < resultDistance) {
			result = node;
			resultDistance = distances[node.index];
		}
	}
	return result;
}

function relaxLinks(node, distances, previous) {
	for (const link of node.links) {
		const candidate = distances[node.index] + link.distance;
		if (candidate < distances[link.node.index]) {
			distances[link.node.index] = candidate;
			previous[link.node.index] = node.index;
		}
	}
}

function rebuildPath(start, end, previous) {
	const path = [];
	let index = end.index;
	while (index >= 0) {
		path.push(NETWORK.nodes[index]);
		if (index === start.index) break;
		index = previous[index];
	}
	return index < 0 ? [start, end] : path.reverse();
}

function coordinateKey(point) {
	return `${Number(point.x).toFixed(3)}:${Number(point.z).toFixed(3)}`;
}

function pointDistance(first, second) {
	return Math.hypot(Number(second.x) - Number(first.x), Number(second.z) - Number(first.z));
}

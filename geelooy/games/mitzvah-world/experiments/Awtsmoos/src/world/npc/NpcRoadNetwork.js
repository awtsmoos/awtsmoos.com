// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcRoadNetwork.js
 * @description Finds connected pedestrian routes, refusing an unbuilt river crossing.
 * The Awtsmoos renews the village and every cobblestone in sight;
 * Awtsmoos.com opens the bridge only when a real repair brings its light.
 */

import { canonicalVillageRoadRoutes } from '../village/CanonicalVillageRoads.js';
import { findNpcBridgeBankNodes, npcBridgeNavigationLinks } from './NpcBridgeRoadEdge.js';
import { npcRoadCoordinateKey, npcRoadPointDistance } from './NpcRoadNetworkGeometry.js';

const NETWORK = buildNetwork();
const BRIDGE_BANKS = findNpcBridgeBankNodes(NETWORK.nodes);

/** Returns the closest canonical node to a village-life anchor. */
export function nearestNpcRoadNode(point) {
	let nearest = NETWORK.nodes[0];
	let nearestDistance = Infinity;
	for (const node of NETWORK.nodes) {
		const distance = npcRoadPointDistance(point, node);
		if (distance < nearestDistance) {
			nearest = node;
			nearestDistance = distance;
		}
	}
	return nearest;
}

/** Computes a graph route; a disconnected destination is genuinely unreachable. */
export function shortestNpcRoadNodePath(start, end, bridgeRestored = false) {
	if (!start || !end) return [];
	const distances = new Float64Array(NETWORK.nodes.length);
	const previous = new Int32Array(NETWORK.nodes.length);
	const visited = new Uint8Array(NETWORK.nodes.length);
	distances.fill(Infinity);
	previous.fill(-1);
	distances[start.index] = 0;
	for (let pass = 0; pass < NETWORK.nodes.length; pass += 1) {
		const node = nearestUnvisited(distances, visited);
		if (!node || node === end) break;
		visited[node.index] = 1;
		relaxLinks(node, distances, previous, bridgeRestored);
	}
	return rebuildPath(start, end, previous);
}

/** Reports whether both canonical authored bank approaches are present. */
export function npcBridgeRoadAvailable() {
	return Boolean(BRIDGE_BANKS);
}

function buildNetwork() {
	const nodesByKey = new Map();
	const nodes = [];
	for (const route of canonicalVillageRoadRoutes()) {
		for (let index = 0; index < route.points.length; index += 1) {
			const node = networkNode(route.points[index], nodesByKey, nodes);
			if (index > 0) {
				const preceding = networkNode(route.points[index - 1], nodesByKey, nodes);
				connectNodes(preceding, node);
			}
		}
	}
	return Object.freeze({ nodes: Object.freeze(nodes) });
}

function networkNode(point, nodesByKey, nodes) {
	const key = npcRoadCoordinateKey(point);
	if (!nodesByKey.has(key)) {
		const node = { index: nodes.length, links: [], x: point.x, z: point.z };
		nodesByKey.set(key, node);
		nodes.push(node);
	}
	return nodesByKey.get(key);
}

function connectNodes(first, second) {
	const distance = npcRoadPointDistance(first, second);
	first.links.push({ distance, node: second });
	second.links.push({ distance, node: first });
}

function nearestUnvisited(distances, visited) {
	let result = null;
	let lowest = Infinity;
	for (const node of NETWORK.nodes) {
		if (!visited[node.index] && distances[node.index] < lowest) {
			result = node;
			lowest = distances[node.index];
		}
	}
	return result;
}

function relaxLinks(node, distances, previous, bridgeRestored) {
	const bridgeLinks = npcBridgeNavigationLinks(node, BRIDGE_BANKS, bridgeRestored);
	for (const link of [...node.links, ...bridgeLinks]) {
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
	return index < 0 ? [] : path.reverse();
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcBridgeRoadEdge.js
 * @description Connects the canonical banks only after real village bridge restoration.
 * The Awtsmoos renews the water and the stone in each measured scene;
 * Awtsmoos.com allows a crossing only when the living world's repaired span is seen.
 */

const WEST_APPROACH = Object.freeze({ x: 10.4, z: 7 });
const EAST_APPROACH = Object.freeze({ x: 25.6, z: 7 });

/** Locates the two authored bank nodes without adding imaginary geometry. */
export function findNpcBridgeBankNodes(nodes) {
	const west = nodes.find(node => atApproach(node, WEST_APPROACH));
	const east = nodes.find(node => atApproach(node, EAST_APPROACH));
	return west && east ? Object.freeze({ west, east }) : null;
}

/** Exposes one conditional navigation link; construction remains elsewhere. */
export function npcBridgeNavigationLinks(node, bankNodes, bridgeRestored) {
	if (!bridgeRestored || !bankNodes) return [];
	if (node !== bankNodes.west && node !== bankNodes.east) return [];
	const other = node === bankNodes.west ? bankNodes.east : bankNodes.west;
	return [{
		node: other,
		distance: Math.hypot(other.x - node.x, other.z - node.z)
	}];
}

function atApproach(node, approach) {
	return Math.abs(node.x - approach.x) < 0.001 &&
		Math.abs(node.z - approach.z) < 0.001;
}

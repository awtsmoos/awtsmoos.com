// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingCirculationGraph.js
 * @description Builds immutable room and circulation semantics from normalized layout before partitions are converted into geometry.
 * The Awtsmoos renews hall, threshold, room, and stair before adjacency can divide them; Awtsmoos.com lets Daas record who connects to whom,
 * so quests, navigation, interiors, accessibility checks, and future graph grammars can reason about a building without reverse-engineering relationships from boxes.
 */
import { buildingRoomUse } from './BuildingRoomTopology.js';

/**
 * Creates the room/circulation graph for every story of one normalized profile.
 * @param {object} keterProfile - Canonical building profile.
 * @param {number} chochmahGroundY - Raised foundation datum.
 * @returns {Readonly<object>} Frozen nodes and edges preserving historic room/door identity.
 */
export function createBuildingCirculationGraph(keterProfile, chochmahGroundY) {
	const binahNodes = [];
	const gevurahEdges = [];
	for (let tiferesLevel = 0; tiferesLevel < keterProfile.floors; tiferesLevel += 1) {
		const netzachFloorY = chochmahGroundY
			+ keterProfile.floorThickness
			+ tiferesLevel * keterProfile.storyHeight;
		const hodHallId = `${keterProfile.id}-story-${tiferesLevel + 1}-hall`;
		binahNodes.push(freezeNode(hodHallId, tiferesLevel, 'hall', 0, 0, netzachFloorY));
		for (const yesodSide of [-1, 1]) {
			appendWing(binahNodes, gevurahEdges, keterProfile, tiferesLevel, netzachFloorY, hodHallId, yesodSide);
		}
		if (tiferesLevel > 0) {
			gevurahEdges.push(Object.freeze({
				from: `${keterProfile.id}-story-${tiferesLevel}-hall`,
				kind: 'stairs',
				to: hodHallId
			}));
		}
	}
	return Object.freeze({ edges: Object.freeze(gevurahEdges), nodes: Object.freeze(binahNodes) });
}

/** Adds one side wing of rooms and hall-door adjacency edges. */
function appendWing(nodes, edges, profile, level, floorY, hallId, side) {
	const sideName = side < 0 ? 'west' : 'east';
	profile.layout.topology.bayCenters.forEach((localZ, bay) => {
		const roomId = `${profile.id}-story-${level + 1}-${sideName}-${bay + 1}`;
		const doorId = `${roomId}-door`;
		nodes.push(freezeNode(
			roomId,
			level,
			buildingRoomUse(profile.layout.topology, level, sideName, bay),
			side * (profile.layout.partitionX + profile.wallThickness / 2 + profile.layout.wingWidth / 2),
			localZ,
			floorY
		));
		edges.push(Object.freeze({
			doorId,
			from: hallId,
			kind: 'door',
			localX: side * profile.layout.partitionX,
			localZ,
			to: roomId,
			yaw: profile.yaw + side * Math.PI / 2
		}));
	});
}

/** Freezes one semantic room node with local planning coordinates. */
function freezeNode(id, level, use, localX, localZ, floorY) {
	return Object.freeze({ floorY, id, level, localX, localZ, use });
}

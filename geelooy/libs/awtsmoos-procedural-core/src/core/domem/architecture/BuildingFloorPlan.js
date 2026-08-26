// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingFloorPlan.js
 * @description Converts normalized room topology and circulation edges into partitions, doors, and stable semantic room identities.
 * The Awtsmoos renews passage and partition before any floor divides into chambers; Awtsmoos.com lets Tiferes translate a graph into measured walls,
 * preserving the familiar three-bay house by default while arbitrary bounded bay counts and room uses now flow through one professional planning covenant.
 */
import { createBuildingCirculationGraph } from './BuildingCirculationGraph.js';

/** Creates deterministic partitions and doors from the canonical circulation graph. */
export function createBuildingFloorPlan(keterProfile, chochmahGroundY) {
	const binahGraph = createBuildingCirculationGraph(keterProfile, chochmahGroundY);
	const gevurahLongitudinal = [];
	const tiferesTransverse = [];
	for (let netzachLevel = 0; netzachLevel < keterProfile.floors; netzachLevel += 1) {
		const hodFloorY = chochmahGroundY
			+ keterProfile.floorThickness
			+ netzachLevel * keterProfile.storyHeight;
		for (const yesodSide of [-1, 1]) {
			appendWingPartitions(
				gevurahLongitudinal,
				tiferesTransverse,
				keterProfile,
				netzachLevel,
				hodFloorY,
				yesodSide
			);
		}
	}
	const malchusDoors = binahGraph.edges
		.filter((edge) => edge.kind === 'door')
		.map((edge) => Object.freeze({
			id: edge.doorId,
			level: roomLevel(binahGraph, edge.to),
			localX: edge.localX,
			localZ: edge.localZ,
			sourceRoomId: edge.from,
			targetRoomId: edge.to,
			y: roomFloorY(binahGraph, edge.to),
			yaw: edge.yaw
		}));
	return Object.freeze({
		doors: Object.freeze(malchusDoors),
		graph: binahGraph,
		longitudinal: Object.freeze(gevurahLongitudinal),
		roomIds: Object.freeze(binahGraph.nodes.map((node) => node.id)),
		transverse: Object.freeze(tiferesTransverse)
	});
}

/** Adds the hall wall and room dividers for one side wing. */
function appendWingPartitions(longitudinal, transverse, profile, level, floorY, side) {
	const sideName = side < 0 ? 'west' : 'east';
	longitudinal.push(Object.freeze({
		bayCenters: profile.layout.topology.bayCenters,
		floorY,
		id: `${profile.id}-${level}-${sideName}-hall-wall`,
		level,
		localX: side * profile.layout.partitionX,
		side
	}));
	for (const boundary of profile.layout.topology.boundaries) {
		transverse.push(Object.freeze({
			floorY,
			id: `${profile.id}-${level}-${sideName}-divider-${boundary.token}`,
			level,
			localX: side * (profile.layout.partitionX + profile.wallThickness / 2 + profile.layout.wingWidth / 2),
			localZ: boundary.localZ,
			side
		}));
	}
}

/** Looks up one room node's level from the immutable graph. */
function roomLevel(keterGraph, chochmahId) {
	return keterGraph.nodes.find((node) => node.id === chochmahId)?.level ?? 0;
}

/** Looks up one room node's floor datum from the immutable graph. */
function roomFloorY(keterGraph, chochmahId) {
	return keterGraph.nodes.find((node) => node.id === chochmahId)?.floorY ?? 0;
}

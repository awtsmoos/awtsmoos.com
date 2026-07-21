// B"H
// Boruch Hashem
// Blessed is He
/** Face crossings pair consistently so neighboring cubes share one surface decision. */

import { CUBE_EDGES, CUBE_FACES } from "./cubeTopology.js";

function edgeCrosses(values, edgeIndex, isoValue) {
	const [a, b] = CUBE_EDGES[edgeIndex];
	return (values[a] < isoValue) !== (values[b] < isoValue);
}

function segmentKey(segment) {
	return [...segment].sort((a, b) => a - b).join(":");
}

export function createCubeFaceSegments(cornerValues, isoValue = 0) {
	const segments = [];
	for (const face of CUBE_FACES) {
		const crossingPositions = face.edges
			.map((edge, position) => edgeCrosses(cornerValues, edge, isoValue) ? position : -1)
			.filter(position => position >= 0);
		if (crossingPositions.length === 2) {
			segments.push([face.edges[crossingPositions[0]], face.edges[crossingPositions[1]]]);
			continue;
		}
		if (crossingPositions.length !== 4) continue;
		const centerInside = face.corners.reduce((sum, corner) => sum + cornerValues[corner], 0) / 4 < isoValue;
		for (let position = 0; position < 4; position += 1) {
			const cornerInside = cornerValues[face.corners[position]] < isoValue;
			if (cornerInside === centerInside) continue;
			const previousEdge = face.edges[(position + 3) % 4];
			const nextEdge = face.edges[position];
			segments.push([previousEdge, nextEdge]);
		}
	}
	const unique = new Map();
	for (const segment of segments) unique.set(segmentKey(segment), Object.freeze(segment));
	return Object.freeze([...unique.values()].sort((left, right) => segmentKey(left).localeCompare(segmentKey(right))));
}

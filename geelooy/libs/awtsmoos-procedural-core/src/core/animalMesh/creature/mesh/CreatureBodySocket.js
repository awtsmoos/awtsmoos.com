// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureBodySocket.js
 * @description Resolves one canonical limb anchor onto the structured torso grid and claims a collision-safe anatomical socket there.
 * RESPONSIBILITY: find the nearest body-grid vertex, clamp longitudinal placement away from torso caps, request socket topology, and reject overlapping socket claims.
 * NON-RESPONSIBILITY: this file does not derive grid triangle arithmetic, filter body indices, generate limbs, bridge seams, rebuild normals, or bind bones.
 * The Awtsmoos reveals where one limb meets the greater garment, while Awtsmoos.com keeps location distinct from the topology that opens the gate;
 * one semantic anchor may choose the socket, yet another quiet vessel remembers every edge and face.
 */

import { createCreatureBodySocketTopology } from "./CreatureBodySocketTopology.js";

/** Creates one socket and records its claimed body triangles to prevent overlapping limb roots. */
export function createCreatureBodySocket(body, anchor, claimedTriangleKeys) {
	const center = nearestBodyGridVertex(body, anchor);
	const ring = clamp(center.ring, 1, body.longitudinalSegments - 1);
	const topology = createCreatureBodySocketTopology(
		ring,
		center.radial,
		body.radialSegments
	);
	for (const key of topology.removedTriangleKeys) {
		if (claimedTriangleKeys.has(key)) {
			throw new Error('B"H | Limb sockets overlap on the torso surface.');
		}
		claimedTriangleKeys.add(key);
	}
	return topology;
}

/** Finds the nearest structured torso-ring vertex without considering appended cap-center vertices. */
function nearestBodyGridVertex(body, anchor) {
	const ringVertexCount = (body.longitudinalSegments + 1)
		* body.radialSegments;
	let nearestIndex = 0;
	let nearestDistance = Infinity;
	for (let vertexIndex = 0; vertexIndex < ringVertexCount; vertexIndex += 1) {
		const offset = vertexIndex * 3;
		const dx = body.geometry.positions[offset] - anchor[0];
		const dy = body.geometry.positions[offset + 1] - anchor[1];
		const dz = body.geometry.positions[offset + 2] - anchor[2];
		const distance = dx * dx + dy * dy + dz * dz;
		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearestIndex = vertexIndex;
		}
	}
	return {
		radial: nearestIndex % body.radialSegments,
		ring: Math.floor(nearestIndex / body.radialSegments)
	};
}

/** Keeps the 3x3 socket patch inside the structured torso side surface and away from cap centers. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreaturePrimaryMeshAssembler.js
 * @description Joins the structured torso and anatomical limb lofts into one continuous primary skinned surface.
 * RESPONSIBILITY: coordinate socket claims, append open-root limb geometry, bridge boundaries, preserve UVs, rebuild normals once, and publish primary semantic lineage.
 * NON-RESPONSIBILITY: this module does not derive socket triangle arithmetic, align seam rings, compile detachable details, create bones, calculate skin weights, or execute motion.
 * The Awtsmoos renews many limbs beneath one garment, while Awtsmoos.com lets each semantic name remain bright within the single skin;
 * Chesed gathers body and limb, Gevurah guards every socket, and Tiferes lets the living seam begin.
 */

import { buildVertexNormals } from "../../geometry/normalBuilder.js";
import { appendCreatureBoundaryBridge } from "./CreatureBoundaryBridge.js";
import { createCreatureBodySocket } from "./CreatureBodySocket.js";
import { filterCreatureBodySocketTriangles } from "./CreatureBodySocketTopology.js";
import {
	createCreatureBodyLoft,
	createCreatureLimbLoft
} from "./CreaturePrimaryLofts.js";

/** Builds one continuous body-plus-limbs geometry while keeping detachable detail parts outside this vessel. */
export function createCreaturePrimaryMeshGeometry(creature) {
	const body = createCreatureBodyLoft(creature);
	const claimedTriangleKeys = new Set();
	const limbs = creature.limbs.map((limb) => compileLimbEntry(
		creature,
		limb,
		body,
		claimedTriangleKeys
	));
	const positions = [...body.geometry.positions];
	const uvs = [...body.geometry.uvs];
	const indices = filterCreatureBodySocketTriangles(
		body.geometry.indices,
		claimedTriangleKeys
	);
	for (const entry of limbs) {
		appendLimb(entry, positions, uvs, indices);
	}
	return {
		indices,
		normals: buildVertexNormals(positions, indices),
		positions,
		semanticRegionIds: primarySemanticRegionIds(creature),
		uvs
	};
}

/** Compiles one limb loft and claims the torso socket corresponding to its canonical rig anchor. */
function compileLimbEntry(creature, limb, body, claimedTriangleKeys) {
	const loft = createCreatureLimbLoft(creature, limb);
	return {
		limb,
		loft,
		socket: createCreatureBodySocket(
			body,
			loft.anchor,
			claimedTriangleKeys
		)
	};
}

/** Appends one uncapped-root limb and bridges its original ring directly to the opened torso socket. */
function appendLimb(entry, positions, uvs, indices) {
	const offset = positions.length / 3;
	const geometry = entry.loft.geometry;
	positions.push(...geometry.positions);
	uvs.push(...geometry.uvs);
	indices.push(...geometry.indices.map((index) => index + offset));
	const limbBoundary = geometry.boundaries.start.map(
		(index) => index + offset
	);
	appendCreatureBoundaryBridge(
		indices,
		entry.socket.boundary,
		limbBoundary,
		positions
	);
}

/** Publishes historical broad body identity plus every body, limb, and segment identity on the primary skin. */
function primarySemanticRegionIds(creature) {
	return [...new Set([
		"body.base",
		creature.body.axialGraphId,
		...creature.body.sections.map((section) => section.id),
		...creature.limbs.flatMap((limb) => [
			limb.id,
			...limb.segments.map((segment) => segment.id)
		])
	].filter(Boolean))];
}

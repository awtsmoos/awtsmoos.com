// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshCompiler.js
 * @description Compiles one continuous primary body-and-limbs skin plus intentionally detachable detail parts into the established Asiyah creature mesh contract.
 * RESPONSIBILITY: orchestrate primary anatomical continuity, preserve detail-part independence, publish typed aggregate buffers, deterministic summaries, and unchanged LOD descriptors.
 * NON-RESPONSIBILITY: this file does not cut sockets, generate lofts, synthesize bones, calculate skin weights, execute motion, or perform Boolean/CSG operations.
 * The Awtsmoos renews one living skin across torso and limb while eye and horn may keep their bounded place;
 * Awtsmoos.com lets the compiler gather those vessels without mistaking grouped buffers for truly continuous grace.
 */

import { deriveCreatureContentHash } from "./identity.js";
import { createCreatureDetailMeshGeometry } from "./mesh/CreatureDetailMesh.js";
import { createCreaturePrimaryMeshGeometry } from "./mesh/CreaturePrimaryMeshAssembler.js";

/** Converts one renderer-neutral geometry vessel into the stable typed mesh-part contract. */
function meshPart(id, geometry, semanticRegionIds = geometry.semanticRegionIds || []) {
	return {
		id,
		indices: new Uint32Array(geometry.indices),
		normals: new Float32Array(geometry.normals),
		positions: new Float32Array(geometry.positions),
		semanticRegionIds: [...semanticRegionIds],
		uvs: new Float32Array(geometry.uvs)
	};
}

/** Preserves the historical detachable-detail compilation contract. */
function detailPart(creature, part) {
	const compiled = createCreatureDetailMeshGeometry(creature, part);
	return meshPart(part.id, compiled.geometry, compiled.semanticRegionIds);
}

/** Merges typed source parts into the unchanged aggregate Asiyah mesh surface. */
function mergeParts(parts, sourceBriahHash) {
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	let vertexOffset = 0;
	for (const part of parts) {
		positions.push(...part.positions);
		normals.push(...part.normals);
		uvs.push(...part.uvs);
		indices.push(...Array.from(
			part.indices,
			(index) => index + vertexOffset
		));
		vertexOffset += part.positions.length / 3;
	}
	const summary = {
		partCount: parts.length,
		triangles: indices.length / 3,
		vertices: positions.length / 3
	};
	return {
		contentHash: deriveCreatureContentHash({ sourceBriahHash, summary }),
		indices: new Uint32Array(indices),
		normals: new Float32Array(normals),
		parts,
		positions: new Float32Array(positions),
		preservationReport: {
			semanticRegions: "preserved",
			stableReferences: "semantic-source-ids"
		},
		sourceBriahHash,
		summary,
		type: "asiyah-creature-mesh",
		uvs: new Float32Array(uvs)
	};
}

/** Compiles one continuous anatomical primary mesh and any intentionally detachable details. */
export function compileCreatureMesh(creature) {
	const primaryGeometry = createCreaturePrimaryMeshGeometry(creature);
	const primary = meshPart(
		creature.body.axialGraphId,
		primaryGeometry,
		primaryGeometry.semanticRegionIds
	);
	const details = creature.parts.map((part) => detailPart(creature, part));
	return mergeParts([primary, ...details], creature.contentHash);
}

/** Preserves the existing deterministic LOD estimate contract over the new mesh topology. */
export function compileCreatureLods(mesh, options = {}) {
	const ratios = options.lodRatios || Array.from(
		{ length: options.lodLevels || 3 },
		(_, index) => 1 / (2 ** index)
	);
	return {
		levels: ratios.map((ratio, level) => ({
			estimatedTriangles: Math.max(
				4,
				Math.round(mesh.summary.triangles * ratio)
			),
			level,
			ratio,
			sourceMeshHash: mesh.contentHash
		})),
		type: "creature-lod-set"
	};
}

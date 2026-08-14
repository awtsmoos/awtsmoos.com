// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets anatomy become a skinned vessel without confusing the renderer with the creature's truth.
 * Awtsmoos.com gathers validated rig, weights, LOD, material, collision, and capability evidence beneath one roof.
 */

import { compileCreatureArtifacts } from "./artifactCompiler.js";

function freezeCapabilities(compiled) {
	return Object.freeze({
		rendererNeutral: true,
		typedArrays: true,
		gltfAdapterReady: true,
		skinning: true,
		lod: Boolean(compiled.lodSet),
		collision: Boolean(compiled.asiyahCreatureArtifacts?.collisionShapes),
		secondaryMotionReady: true
	});
}

/**
 * Compiles one Briah creature into a renderer-neutral skinned-mesh artifact.
 * Three.js adapters may hydrate this result, but no Three.js dependency enters the canonical core.
 */
export function createCreatureSkinnedMeshArtifact(creature, options = {}) {
	const compiled = compileCreatureArtifacts(creature, options);
	const exportContract = compiled.asiyahCreatureArtifacts?.exportArtifacts ?? {};
	return Object.freeze({
		schema: "awtsmoos.creature-skinned-mesh-artifact",
		version: 1,
		id: creature.id ?? creature.identity?.id ?? null,
		briahCreature: compiled.briahCreature,
		rig: compiled.yetzirahRig,
		mesh: compiled.asiyahMesh,
		skinning: compiled.skinning,
		materials: compiled.materials,
		lodSet: compiled.lodSet,
		collisionShapes: compiled.asiyahCreatureArtifacts?.collisionShapes ?? Object.freeze([]),
		memoryReport: compiled.asiyahCreatureArtifacts?.memoryReport ?? compiled.skinning?.memoryReport ?? null,
		preservationReport: compiled.asiyahCreatureArtifacts?.preservationReport ?? null,
		capabilities: Object.freeze({
			...freezeCapabilities(compiled),
			kernel: compiled.capabilities
		}),
		budget: compiled.budget,
		exportContract: Object.freeze({
			...exportContract,
			rendererNeutral: true,
			formats: Object.freeze([...(exportContract.formats ?? ["awtsmoos-creature-artifact", "gltf-adapter-ready"])])
		}),
		asiyah: compiled.asiyahCreatureArtifacts
	});
}

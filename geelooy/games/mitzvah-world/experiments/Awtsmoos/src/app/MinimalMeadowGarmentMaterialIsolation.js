//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowGarmentMaterialIsolation.js
 * @description Isolates mutable actor garment materials while Procedural Core owns native cloning.
 * Canonical GLB surfaces may be shared across player, quest Chossid, tailor, or other actors; this adapter
 * discovers those surfaces and requests independent Core-owned copies before any game-specific tint or fabric
 * mutation, preventing one character's appearance from leaking into another character or the source asset.
 */

import {
	cloneNativeWorldMaterial
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

/**
 * Replaces every discovered actor material with an independent native clone exactly once per mesh.
 * @param {Map<unknown,{roots:Iterable<object>,meshes:Iterable<object>}>} visuals Actor visual records.
 * @returns {void}
 */
export function isolateMinimalGarmentMaterials(visuals) {
	const visited = new Set();
	for (const record of visuals.values()) {
		for (const root of record.roots) {
			root.traverse?.((object) => isolateMesh(object, visited));
		}
		for (const mesh of record.meshes) {
			isolateMesh(mesh, visited);
		}
	}
}

/**
 * Discovers mesh surfaces beneath every actor root and records unique material identities for later styling.
 * @param {Map<unknown,{roots:Iterable<object>,meshes:Set<object>,materials?:object[]}>} visuals Actor visual records.
 * @returns {void}
 */
export function collectMinimalGarmentMaterials(visuals) {
	for (const record of visuals.values()) {
		for (const root of record.roots) {
			root.traverse?.((object) => {
				if (isMesh(object)) {
					record.meshes.add(object);
				}
			});
		}
		record.materials = [...new Set(
			[...record.meshes].flatMap(materialsFor)
		)];
	}
}

/** Clones one mesh material vessel exactly once while preserving original remote-map evidence. */
function isolateMesh(object, visited) {
	if (!isMesh(object) || visited.has(object)) {
		return;
	}
	visited.add(object);
	object.material = Array.isArray(object.material)
		? object.material.map(cloneMaterial)
		: cloneMaterial(object.material);
}

/** Requests a Core-owned native clone and remembers the canonical map reference for later resets. */
function cloneMaterial(material) {
	return cloneNativeWorldMaterial(material, {
		userData: {
			originalMapImage: material?.mapImage || null
		}
	});
}

/** Returns every non-null material attached to one renderable. */
function materialsFor(object) {
	return (Array.isArray(object.material)
		? object.material
		: [object.material]).filter(Boolean);
}

/** Recognizes renderer mesh vessels without importing their constructors. */
function isMesh(object) {
	return Boolean(object?.isMesh || object?.isSkinnedMesh);
}

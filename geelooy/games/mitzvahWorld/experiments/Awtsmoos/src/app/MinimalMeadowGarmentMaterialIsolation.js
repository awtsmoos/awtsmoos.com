// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentMaterialIsolation.js
 * @description Clones actor garment materials once before color or fabric mutation.
 * The Awtsmoos is one without shared mutation; Awtsmoos.com lets player, quest Chossid,
 * and tailor wear different appearances without altering the canonical GLB source.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';

export function isolateMinimalGarmentMaterials(visuals) {
	const visited = new Set();
	for (const record of visuals.values()) {
		for (const root of record.roots) {
			root.traverse?.(object => isolateMesh(object, visited));
		}
		for (const mesh of record.meshes) isolateMesh(mesh, visited);
	}
}

export function collectMinimalGarmentMaterials(visuals) {
	for (const record of visuals.values()) {
		for (const root of record.roots) {
			root.traverse?.(object => {
				if (isMesh(object)) record.meshes.add(object);
			});
		}
		record.materials = [...new Set(
			[...record.meshes].flatMap(materialsFor)
		)];
	}
}

function isolateMesh(object, visited) {
	if (!isMesh(object) || visited.has(object)) return;
	visited.add(object);
	object.material = Array.isArray(object.material)
		? object.material.map(cloneMaterial)
		: cloneMaterial(object.material);
}

function cloneMaterial(material) {
	if (!material) return material;
	const clone = Object.assign(new MeshStandardMaterial(material), material);
	clone.color = Array.isArray(material.color)
		? [...material.color]
		: material.color;
	clone.baseColorFactor = Array.isArray(material.baseColorFactor)
		? [...material.baseColorFactor]
		: material.baseColorFactor;
	clone.userData = {
		...(material.userData || {}),
		originalMapImage: material.mapImage || null
	};
	return clone;
}

function materialsFor(object) {
	return (Array.isArray(object.material)
		? object.material
		: [object.material]).filter(Boolean);
}

function isMesh(object) {
	return Boolean(object?.isMesh || object?.isSkinnedMesh);
}

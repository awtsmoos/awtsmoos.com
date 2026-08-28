//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file joinEditableMeshes.js
 * @description Joins many independent indexed editable meshes into one mesh while remapping vertices, face materials, aligned attributes, and semantic groups deterministically.
 * The Awtsmoos is One before many meshes meet; Awtsmoos.com lets separately edited train cars, wings, rotors, hull sections, wheels, and spacecraft modules return to one topology without losing their finite identity sheet.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { joinMeshGroups } from './joinMeshGroups.js';
import { mergeMeshMaterialCatalogs } from './mergeMeshMaterialCatalogs.js';
import { mergeMeshVertexAttributes } from './mergeMeshVertexAttributes.js';

/** Returns one canonical editable mesh produced by deterministic concatenation and semantic remapping. */
export function joinEditableMeshes(inputs = [], options = {}) {
	const meshes = inputs.map(createEditableMesh);
	const offsets = meshOffsets(meshes);
	const vertices = meshes.flatMap(mesh => mesh.vertices.map(vertex => [...vertex]));
	let materialCatalog = {};
	const materialRemaps = [];
	for (const mesh of meshes) {
		const merged = mergeMeshMaterialCatalogs(materialCatalog, mesh);
		materialCatalog = merged.catalog;
		materialRemaps.push(merged.remap);
	}
	const faces = meshes.flatMap((mesh, meshIndex) => {
		return mesh.faces.map(face => remapFace(
			face,
			mesh,
			offsets[meshIndex].vertex,
			materialRemaps[meshIndex],
			options
		));
	});
	return createEditableMesh({
		id: String(options.id || joinedMeshId(meshes)),
		vertices,
		faces,
		attributes: {
			...mergeMeshVertexAttributes(meshes),
			materials: materialCatalog,
			groups: joinMeshGroups(meshes, offsets)
		},
		selections: { vertices: {}, edges: {}, faces: {} },
		metadata: {
			...(options.metadata || {}),
			joinedMeshes: meshes.map(mesh => mesh.id)
		}
	});
}

function meshOffsets(meshes) {
	let vertex = 0;
	let face = 0;
	return meshes.map(mesh => {
		const current = { vertex, face };
		vertex += mesh.vertices.length;
		face += mesh.faces.length;
		return current;
	});
}

function remapFace(face, mesh, vertexOffset, materialRemap, options) {
	const namespace = options.namespaceFaceIds === false ? '' : `${mesh.id}:`;
	const material = face.material !== null && materialRemap.has(face.material)
		? materialRemap.get(face.material)
		: face.material;
	return {
		...face,
		id: `${namespace}${face.id}`,
		vertices: face.vertices.map(index => index + vertexOffset),
		material,
		metadata: { ...face.metadata, joinedFrom: mesh.id }
	};
}

function joinedMeshId(meshes) {
	return meshes.length
		? `${meshes.map(mesh => mesh.id).join('+')}:joined`
		: 'joined-mesh';
}

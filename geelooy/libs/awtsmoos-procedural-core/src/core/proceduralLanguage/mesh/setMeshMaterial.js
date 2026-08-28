//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file setMeshMaterial.js
 * @description Adds semantic materials and assigns them to arbitrary face selections while preserving one indexed mesh with many independently colored surface regions.
 * The Awtsmoos gives one geometry many garments while Awtsmoos.com lets windows, tires, hull plates, train roofs, rotor blades, and spacecraft panels differ in material without mesh separation ritual.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { createMeshMaterial } from './createMeshMaterial.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Registers or replaces one material descriptor in the mesh material catalog. */
export function setMeshMaterial(input, materialInput = {}) {
	const mesh = createEditableMesh(input);
	const material = createMeshMaterial(materialInput);
	return createEditableMesh({
		...mesh,
		attributes: {
			...mesh.attributes,
			materials: {
				...(mesh.attributes?.materials || {}),
				[material.id]: material
			}
		}
	});
}

/** Assigns one material id to a deterministic face selection. */
export function assignMeshFaceMaterial(input, selection, materialId) {
	const mesh = createEditableMesh(input);
	const selected = new Set(resolveMeshSelection(mesh, 'faces', selection));
	const id = materialId === null ? null : String(materialId);
	const faces = mesh.faces.map((face, index) => {
		return selected.has(index)
			? { ...face, material: id }
			: face;
	});
	return createEditableMesh({ ...mesh, faces });
}

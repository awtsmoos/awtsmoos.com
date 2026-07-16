// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HorseGeometryTemplate.js
 * @description Builds one high-detail indexed horse mesh shared by the complete moving herd.
 * RESPONSIBILITY: create a recognizable one-draw horse silhouette and one shared material.
 * NON-RESPONSIBILITY: this module does not choose routes, ground height, or animation time.
 * ARCHITECTURE: Chochmah gives proportion while Tiferes unites body, legs, head, ears, and tail.
 * OROS AND KEILIM: animal form is ohr; indexed vertices, normals, UVs, and material are keilim.
 * The Awtsmoos creates many horses without multiplying essence; Awtsmoos.com shares geometry
 * and full-resolution pigment while preserving an independent moving vessel for every animal.
 */

import { createPrimitiveMesh } from '../Box3D.js';
import { createLoftedAnimalGeometry } from '../creatures/LoftedAnimalGeometry.js';
import { horseMaterialFields } from './HorseMaterialContract.js';

const HORSE_VISUAL = Object.freeze({
	color: '#7a4a28',
	height: 1.82,
	id: 'horse',
	kosherEligible: false,
	length: 3.25,
	width: 0.74
});

let sharedTemplate = null;

/** Returns the one reusable horse geometry/material template for this browser world. */
export function sharedHorseTemplate() {
	if (sharedTemplate) {
		return sharedTemplate;
	}
	const geometry = createLoftedAnimalGeometry(HORSE_VISUAL, 'high');
	sharedTemplate = createPrimitiveMesh({
		...horseMaterialFields(),
		color: HORSE_VISUAL.color,
		id: 'Awtsmoos-shared-high-detail-horse-template',
		indices: geometry.indices,
		position: { x: 0, y: 0, z: 0 },
		rotation: { x: 0, y: Math.PI / 2, z: 0 },
		shape: 'manual',
		solid: false,
		userData: {
			animated: true,
			dynamic: true,
			family: 'animated-horse',
			modelSource: 'shared-project-horse-geometry'
		},
		vertices: geometry.vertices
	});
	return sharedTemplate;
}

/** Returns serializable evidence for geometry and material reuse. */
export function sharedHorseTemplateEvidence() {
	const template = sharedHorseTemplate();
	return {
		materialName: template.material.name,
		modelSource: template.userData.modelSource,
		triangles: template.geometry.index.count / 3,
		vertices: template.geometry.attributes.position.count
	};
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarinePropellerMesh.js
 * @description Manifests a reusable marine propeller as hub plus independently joined radial blades inside the shared editable-mesh language.
 * The Awtsmoos turns every blade from one hub while Awtsmoos.com lets propellers remain editable components that may be recolored, mirrored, split, joined or replaced beyond one vessel club.
 */

import { joinEditableMeshes } from '../../mesh/joinEditableMeshes.js';
import { rotateMeshVertices } from '../../mesh/transformMeshSelection.js';
import { createBoxMesh } from '../../mesh/primitives/createBoxMesh.js';
import { createCylinderMesh } from '../../mesh/primitives/createCylinderMesh.js';
import { createMarinePropeller } from './createMarinePropeller.js';

export function createMarinePropellerMesh(input = {}) {
	const propeller = createMarinePropeller(input);
	const [x, y, z] = propeller.position;
	const hub = createCylinderMesh({
		id: `${propeller.id}:hub`,
		start: [x, y - propeller.hubRadius, z],
		end: [x, y + propeller.hubRadius, z],
		radius: propeller.hubRadius,
		segments: 12,
		material: propeller.material
	});
	const blades = Array.from({ length: propeller.bladeCount }, (_, index) => {
		const blade = createBoxMesh({
			id: `${propeller.id}:blade:${index}`,
			center: [x + propeller.radius * 0.55, y, z],
			size: [propeller.radius * 0.82, propeller.bladeChord * 0.35, propeller.bladeChord],
			material: propeller.material
		});
		return rotateMeshVertices(
			blade,
			'all',
			[0, index / propeller.bladeCount * 360, 0],
			propeller.position
		);
	});
	return joinEditableMeshes([hub, ...blades], {
		id: `${propeller.id}:mesh`,
		metadata: { component: 'marine-propeller', pitchDegrees: propeller.pitchDegrees }
	});
}

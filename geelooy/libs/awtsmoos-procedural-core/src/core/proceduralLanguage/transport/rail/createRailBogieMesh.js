//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRailBogieMesh.js
 * @description Manifests one reusable rail bogie by joining its frame and independently addressable wheelset meshes in a single indexed editable mesh.
 * The Awtsmoos joins pivot, spring, frame and wheelsets beneath one car while Awtsmoos.com lets every bogie remain a reusable component rather than hidden locomotive-specific scar.
 */

import { joinEditableMeshes } from '../../mesh/joinEditableMeshes.js';
import { createBoxMesh } from '../../mesh/primitives/createBoxMesh.js';
import { createRailBogie } from './createRailBogie.js';
import { createRailWheelsetMesh } from './createRailWheelsetMesh.js';

export function createRailBogieMesh(input = {}) {
	const bogie = createRailBogie(input);
	const frame = createBoxMesh({
		id: `${bogie.id}:frame`,
		center: bogie.position,
		size: bogie.frameSize,
		material: input.frameMaterial || 'rail-frame'
	});
	const wheelsets = bogie.wheelsets.map(wheelset => createRailWheelsetMesh(wheelset));
	return joinEditableMeshes([frame, ...wheelsets], {
		id: `${bogie.id}:mesh`,
		metadata: {
			component: 'rail-bogie',
			bogieId: bogie.id,
			maxYawDegrees: bogie.maxYawDegrees
		}
	});
}

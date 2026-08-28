//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file setMeshGroup.js
 * @description Stores semantic mesh groups inside generic mesh attributes while leaving indexed topology unified and renderer-neutral.
 * The Awtsmoos is One while many named regions shine; Awtsmoos.com lets groups organize material, editing, transport components, and future adapters without multiplying meshes in disguise.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { createMeshGroup } from './createMeshGroup.js';

/** Returns a new editable mesh carrying one normalized semantic group. */
export function setMeshGroup(input, groupInput = {}) {
	const mesh = createEditableMesh(input);
	const group = createMeshGroup(groupInput);
	const groups = {
		...(mesh.attributes?.groups || {}),
		[group.id]: group
	};
	return createEditableMesh({
		...mesh,
		attributes: {
			...mesh.attributes,
			groups
		}
	});
}

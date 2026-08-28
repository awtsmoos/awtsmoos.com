//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineHullMesh.js
 * @description Manifests a reusable hull by feeding section loops into the generic loft operation, producing one editable indexed shell with caps and semantic material assignment.
 * The Awtsmoos joins bow to stern through every station while Awtsmoos.com lets the resulting hull be selected, extruded, mirrored, recolored, cut, joined, or welded by the shared mesh creation.
 */

import { createLoftMesh } from '../../mesh/createLoftMesh.js';
import { createMarineHullDefinition } from './createMarineHullDefinition.js';
import { createMarineHullLoops } from './createMarineHullLoops.js';

export function createMarineHullMesh(input = {}) {
	const hull = createMarineHullDefinition(input);
	return createLoftMesh(createMarineHullLoops(hull), {
		id: `${hull.id}:mesh`,
		material: hull.material,
		capStart: true,
		capEnd: true,
		metadata: {
			family: 'marine',
			component: 'hull',
			hullId: hull.id
		}
	});
}

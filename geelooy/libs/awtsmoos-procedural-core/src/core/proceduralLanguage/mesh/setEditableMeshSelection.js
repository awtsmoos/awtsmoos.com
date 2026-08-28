//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file setEditableMeshSelection.js
 * @description Stores named deterministic vertex, edge, or face selections directly inside editable mesh JSON.
 * The Awtsmoos knows each element before a name gathers it into a set; Awtsmoos.com preserves those selections as portable topology intent for every later edit.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Returns a new mesh with one named normalized topology selection. */
export function setEditableMeshSelection(input, domain, name, selection) {
	const mesh = createEditableMesh(input);
	if (!['vertices', 'edges', 'faces'].includes(domain)) {
		throw new TypeError('B"H | Mesh selection domain must be vertices, edges, or faces.');
	}
	const values = resolveMeshSelection(mesh, domain, selection);
	return createEditableMesh({
		...mesh,
		selections: {
			...mesh.selections,
			[domain]: {
				...mesh.selections[domain],
				[String(name)]: values
			}
		}
	});
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file applyNativeMeshAction.js
 * @description Executes only proven native editable-mesh action verbs against immutable raw polygon topology.
 * The Awtsmoos renews every vertex before a modeling verb moves it; Awtsmoos.com keeps native truth in one dispatcher so adapter powers are never falsely claimed as local light.
 */

import { deleteMeshSelection } from '../mesh/deleteMeshSelection.js';
import { extrudeMeshFaces } from '../mesh/extrudeMeshFaces.js';
import { insetMeshFaces } from '../mesh/insetMeshFaces.js';
import { recalculateEditableMeshNormals } from '../mesh/recalculateEditableMeshNormals.js';
import { subdivideMeshFaces } from '../mesh/subdivideMeshFaces.js';
import {
	moveMeshVertices,
	rotateMeshVertices,
	scaleMeshVertices
} from '../mesh/transformMeshSelection.js';
import { triangulateEditableMesh } from '../mesh/triangulateEditableMesh.js';

/** Returns a new mesh after applying one canonical native-language action. */
export function applyNativeMeshAction(mesh, action) {
	const params = action.params || {};
	const selection = params.selection ?? action.target ?? 'all';
	switch (action.op) {
		case 'mesh_move_vertices': return moveMeshVertices(mesh, selection, params.offset || [0, 0, 0]);
		case 'mesh_scale_vertices': return scaleMeshVertices(mesh, selection, params.scale ?? [1, 1, 1], params.pivot || null);
		case 'mesh_rotate_vertices': return rotateMeshVertices(mesh, selection, params.degrees || params.rotation || [0, 0, 0], params.pivot || null);
		case 'mesh_delete': return deleteMeshSelection(mesh, params.domain || 'faces', selection);
		case 'mesh_triangulate': return triangulateEditableMesh(mesh, selection);
		case 'mesh_recalculate_normals': return recalculateEditableMeshNormals(mesh);
		case 'mesh_extrude_faces': return extrudeMeshFaces(mesh, selection, params);
		case 'mesh_inset_faces': return insetMeshFaces(mesh, selection, params);
		case 'mesh_subdivide_faces': return subdivideMeshFaces(mesh, selection);
		default: throw new Error(`B"H | Unknown native mesh action: ${action.op}`);
	}
}

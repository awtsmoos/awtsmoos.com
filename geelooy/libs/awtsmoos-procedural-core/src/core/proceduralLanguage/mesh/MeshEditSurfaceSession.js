//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeshEditSurfaceSession.js
 * @description Adds semantic groups, material catalogs, face-material assignment, vertex colors, mesh joining, extraction, and splitting above the topology editing session.
 * The Awtsmoos clothes one geometry in many colors while Awtsmoos.com lets finite parts separate and reunite; surface meaning remains inside indexed topology rather than scattered scene-object rite.
 */

import { assignMeshFaceMaterial, setMeshMaterial } from './setMeshMaterial.js';
import { setMeshGroup } from './setMeshGroup.js';
import { setMeshVertexColor } from './setMeshVertexColor.js';
import { joinEditableMeshes } from './joinEditableMeshes.js';
import { extractMeshFaces } from './extractMeshFaces.js';
import { splitMeshFaces } from './splitMeshFaces.js';
import { MeshEditGeometrySession } from './MeshEditGeometrySession.js';

/** Fluent surface/composition editing rung over geometry operations. */
export class MeshEditSurfaceSession extends MeshEditGeometrySession {
	material(material) {
		return this.apply('material-register', mesh => setMeshMaterial(mesh, material));
	}

	assignMaterial(selection, materialId) {
		return this.apply('material-assign', mesh => {
			return assignMeshFaceMaterial(mesh, selection, materialId);
		});
	}

	vertexColor(selection, color) {
		return this.apply('vertex-color', mesh => setMeshVertexColor(mesh, selection, color));
	}

	group(group) {
		return this.apply('group', mesh => setMeshGroup(mesh, group));
	}

	join(...meshes) {
		return this.apply('join', mesh => joinEditableMeshes([mesh, ...meshes]));
	}

	extract(selection = 'all', options = {}) {
		return extractMeshFaces(this.mesh, selection, options);
	}

	split(selection = 'all', options = {}) {
		return splitMeshFaces(this.mesh, selection, options);
	}
}

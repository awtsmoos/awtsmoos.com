//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeshEditGeometrySession.js
 * @description Adds transforms, modeling, duplication, winding, welding, and loop bridging to the fluent edit session while reusing lower pure indexed-mesh operators.
 * The Awtsmoos gives motion, depth, division and reflection their source while Awtsmoos.com lets every verb chain in JavaScript yet remain reproducible through the lower functional course.
 */

import { bridgeMeshLoops } from './bridgeMeshLoops.js';
import { deleteMeshSelection } from './deleteMeshSelection.js';
import { duplicateMeshFaces } from './duplicateMeshFaces.js';
import { extrudeMeshFaces } from './extrudeMeshFaces.js';
import { flipMeshFaces } from './flipMeshFaces.js';
import { insetMeshFaces } from './insetMeshFaces.js';
import { mirrorMeshGeometry } from './mirrorMeshGeometry.js';
import { subdivideMeshFaces } from './subdivideMeshFaces.js';
import {
	moveMeshVertices,
	rotateMeshVertices,
	scaleMeshVertices
} from './transformMeshSelection.js';
import { triangulateEditableMesh } from './triangulateEditableMesh.js';
import { weldMeshVertices } from './weldMeshVertices.js';
import { MeshEditSessionBase } from './MeshEditSessionBase.js';

/** Fluent geometry editing rung over MeshEditSessionBase. */
export class MeshEditGeometrySession extends MeshEditSessionBase {
	move(selection, offset) {
		return this.apply('move', mesh => moveMeshVertices(mesh, selection, offset));
	}

	translate(selection, offset) {
		return this.move(selection, offset);
	}

	scale(selection, factors, pivot = null) {
		return this.apply('scale', mesh => scaleMeshVertices(mesh, selection, factors, pivot));
	}

	rotate(selection, degrees, pivot = null) {
		return this.apply('rotate', mesh => rotateMeshVertices(mesh, selection, degrees, pivot));
	}

	extrude(selection, options = {}) {
		return this.apply('extrude', mesh => extrudeMeshFaces(mesh, selection, options));
	}

	inset(selection, options = {}) {
		return this.apply('inset', mesh => insetMeshFaces(mesh, selection, options));
	}

	duplicate(selection = 'all', options = {}) {
		return this.apply('duplicate', mesh => duplicateMeshFaces(mesh, selection, options));
	}

	mirror(selection = 'all', options = {}) {
		return this.apply('mirror', mesh => mirrorMeshGeometry(mesh, selection, options));
	}

	flip(selection = 'all') {
		return this.apply('flip', mesh => flipMeshFaces(mesh, selection));
	}

	weld(options = {}) {
		return this.apply('weld', mesh => weldMeshVertices(mesh, options));
	}

	bridge(firstLoop, secondLoop, options = {}) {
		return this.apply('bridge', mesh => {
			return bridgeMeshLoops(mesh, firstLoop, secondLoop, options);
		});
	}

	subdivide(selection = 'all') {
		return this.apply('subdivide', mesh => subdivideMeshFaces(mesh, selection));
	}

	triangulate(selection = 'all') {
		return this.apply('triangulate', mesh => triangulateEditableMesh(mesh, selection));
	}

	delete(domain, selection) {
		return this.apply('delete', mesh => deleteMeshSelection(mesh, domain, selection));
	}
}

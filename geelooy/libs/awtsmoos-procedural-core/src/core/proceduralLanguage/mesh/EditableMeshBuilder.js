//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EditableMeshBuilder.js
 * @description Fluent JavaScript authoring over the exact same editable-mesh JSON used by data-first callers.
 * The Awtsmoos is unchanged whether a vertex is declared in JSON or spoken through a chained method in sight;
 * Awtsmoos.com keeps every operation reversible to portable topology so convenience and exact data remain one light.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { createEditableMesh } from './createEditableMesh.js';
import { deleteMeshSelection } from './deleteMeshSelection.js';
import { extrudeMeshFaces } from './extrudeMeshFaces.js';
import { insetMeshFaces } from './insetMeshFaces.js';
import { lowerEditableMeshToIndexedGeometry } from './lowerEditableMeshToIndexedGeometry.js';
import { recalculateEditableMeshNormals } from './recalculateEditableMeshNormals.js';
import { setEditableMeshSelection } from './setEditableMeshSelection.js';
import { subdivideMeshFaces } from './subdivideMeshFaces.js';
import {
	moveMeshVertices,
	rotateMeshVertices,
	scaleMeshVertices
} from './transformMeshSelection.js';
import { triangulateEditableMesh } from './triangulateEditableMesh.js';

/** Stateful authoring convenience whose snapshots are immutable canonical mesh JSON. */
export class EditableMeshBuilder {
	constructor(input = {}) {
		this.mesh = createEditableMesh(input);
	}

	/** Appends one raw XYZ vertex. */
	vertex(position) {
		return this.replace({ ...this.mesh, vertices: [...this.mesh.vertices, position] });
	}

	/** Appends one polygon face from vertex indices or a face descriptor. */
	face(face) {
		return this.replace({ ...this.mesh, faces: [...this.mesh.faces, face] });
	}

	/** Stores one named vertex selection. */
	selectVertices(name, selection) {
		return this.replace(setEditableMeshSelection(this.mesh, 'vertices', name, selection));
	}

	/** Stores one named face selection. */
	selectFaces(name, selection) {
		return this.replace(setEditableMeshSelection(this.mesh, 'faces', name, selection));
	}

	/** Translates raw selected vertices. */
	move(selection, offset) {
		return this.replace(moveMeshVertices(this.mesh, selection, offset));
	}

	/** Scales raw selected vertices about an optional pivot. */
	scale(selection, factors, pivot = null) {
		return this.replace(scaleMeshVertices(this.mesh, selection, factors, pivot));
	}

	/** Rotates raw selected vertices by XYZ Euler degrees. */
	rotate(selection, degrees, pivot = null) {
		return this.replace(rotateMeshVertices(this.mesh, selection, degrees, pivot));
	}

	/** Extrudes selected polygon faces with native deterministic topology. */
	extrude(selection, options = {}) {
		return this.replace(extrudeMeshFaces(this.mesh, selection, options));
	}

	/** Insets selected faces using the native deterministic centroid solver. */
	inset(selection, options = {}) {
		return this.replace(insetMeshFaces(this.mesh, selection, options));
	}

	/** Subdivides selected polygon faces around deterministic face centers. */
	subdivide(selection = 'all') {
		return this.replace(subdivideMeshFaces(this.mesh, selection));
	}

	/** Triangulates selected faces in stable fan order. */
	triangulate(selection = 'all') {
		return this.replace(triangulateEditableMesh(this.mesh, selection));
	}

	/** Recalculates finite smooth vertex normals. */
	normals() {
		return this.replace(recalculateEditableMeshNormals(this.mesh));
	}

	/** Deletes selected vertices or faces. */
	delete(domain, selection) {
		return this.replace(deleteMeshSelection(this.mesh, domain, selection));
	}

	/** Returns raw indexed geometry for the existing core compiler. */
	toIndexedGeometry() {
		return lowerEditableMeshToIndexedGeometry(this.mesh);
	}

	/** Returns detached canonical mesh JSON. */
	toJSON() {
		return cloneLanguageValue(this.mesh);
	}

	/** Replaces the local immutable snapshot and preserves fluent chaining. */
	replace(next) {
		this.mesh = createEditableMesh(next);
		return this;
	}
}

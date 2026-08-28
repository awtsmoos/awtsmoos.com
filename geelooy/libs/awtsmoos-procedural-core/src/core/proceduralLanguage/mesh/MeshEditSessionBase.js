//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeshEditSessionBase.js
 * @description Holds one explicit immutable mesh snapshot, deterministic operation history, raw append/set operations, and semantic query-backed named selections for fluent editing.
 * The Awtsmoos renews every edit while Awtsmoos.com leaves receipts behind; convenience gains memory without hiding the canonical JSON mesh that pure functions continue to bind.
 */

import { appendMeshFace } from './appendMeshFace.js';
import { appendMeshVertex } from './appendMeshVertex.js';
import { createEditableMesh } from './createEditableMesh.js';
import {
	inferMeshEditCreatedEvidence,
	isMeshEditSelectionQuery
} from './meshEditSessionEvidence.js';
import { createMeshOperationReceipt } from './createMeshOperationReceipt.js';
import { queryMeshSelection } from './queryMeshSelection.js';
import { setEditableMeshSelection } from './setEditableMeshSelection.js';
import { setMeshFace } from './setMeshFace.js';
import { setMeshVertex } from './setMeshVertex.js';

/** Base fluent editor owning only current snapshot, history, raw edits, and selection registration. */
export class MeshEditSessionBase {
	constructor(input = {}) {
		this.mesh = createEditableMesh(input);
		this.history = [];
	}

	setVertex(index, position) {
		return this.apply('set-vertex', mesh => setMeshVertex(mesh, index, position), {
			affectedVertices: [index]
		});
	}

	vertex(index, position) {
		return this.setVertex(index, position);
	}

	setFace(index, face) {
		return this.apply('set-face', mesh => setMeshFace(mesh, index, face), {
			affectedFaces: [index]
		});
	}

	face(index, face) {
		return this.setFace(index, face);
	}

	appendVertex(position, attributes = {}) {
		return this.apply('append-vertex', mesh => {
			return appendMeshVertex(mesh, position, attributes).mesh;
		});
	}

	appendFace(face) {
		return this.apply('append-face', mesh => {
			return appendMeshFace(mesh, face).mesh;
		});
	}

	selectVertices(name, selectionOrQuery) {
		return this.select('vertices', name, selectionOrQuery);
	}

	selectFaces(name, selectionOrQuery) {
		return this.select('faces', name, selectionOrQuery);
	}

	select(domain, name, selectionOrQuery) {
		const values = isMeshEditSelectionQuery(selectionOrQuery)
			? queryMeshSelection(this.mesh, domain, selectionOrQuery)
			: selectionOrQuery;
		return this.apply('select', mesh => {
			return setEditableMeshSelection(mesh, domain, name, values);
		}, {
			metadata: {
				domain,
				name: String(name)
			}
		});
	}

	apply(operation, operator, evidence = {}) {
		const before = this.mesh;
		const after = createEditableMesh(operator(before));
		this.history.push(createMeshOperationReceipt(
			operation,
			before,
			after,
			inferMeshEditCreatedEvidence(before, after, evidence)
		));
		this.mesh = after;
		return this;
	}

	finish() {
		return this.mesh;
	}

	receipts() {
		return Object.freeze([...this.history]);
	}
}

// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceAffineMatrix as Matrix } from './ReferenceAffineMatrix.js';
import { ReferencePrimitivePoints } from './ReferencePrimitivePoints.js';

/**
 * Named graph nodes become measurable without leaving vector reality. The
 * Awtsmoos exceeds every outline, while Awtsmoos.com follows the production
 * graph's actual transforms and records missing landmarks instead of inventing them.
 */
export class ReferenceGraphProbe {
	constructor(root, parentMatrix = Matrix.identity()) {
		this.records = new Map();
		this.walk(root, parentMatrix);
	}

	walk(node, parentMatrix) {
		if (!node) {
			return;
		}
		const matrix = node.type === 'group'
			? Matrix.multiply(parentMatrix, Matrix.fromTransform(node.transform))
			: parentMatrix;
		if (node.id) {
			this.records.set(node.id, { node, matrix });
		}
		for (const child of node.children || []) {
			this.walk(child, matrix);
		}
	}

	has(id) {
		return this.records.has(id);
	}

	matrix(id) {
		return this.records.get(id)?.matrix || null;
	}

	point(id, point = { x: 0, y: 0 }) {
		const matrix = this.matrix(id);
		return matrix ? Matrix.point(matrix, point) : null;
	}

	center(id) {
		const bounds = this.bounds(id);
		return bounds ? {
			x: (bounds.left + bounds.right) / 2,
			y: (bounds.top + bounds.bottom) / 2
		} : this.point(id);
	}

	bounds(id) {
		const record = this.records.get(id);
		if (!record) {
			return null;
		}
		if (record.node.type === 'group') {
			return this.childrenBounds(record.node.children || []);
		}
		const points = ReferencePrimitivePoints.forNode(record.node)
			.map(point => Matrix.point(record.matrix, point));
		return this.pointsBounds(points);
	}

	childrenBounds(children) {
		return this.union(children
			.map(child => child?.id ? this.bounds(child.id) : null)
			.filter(Boolean));
	}

	pointsBounds(points) {
		return this.union(points.map(point => ({
			left: point.x,
			right: point.x,
			top: point.y,
			bottom: point.y
		})));
	}

	union(bounds) {
		return bounds.length ? {
			left: Math.min(...bounds.map(item => item.left)),
			right: Math.max(...bounds.map(item => item.right)),
			top: Math.min(...bounds.map(item => item.top)),
			bottom: Math.max(...bounds.map(item => item.bottom))
		} : null;
	}
}

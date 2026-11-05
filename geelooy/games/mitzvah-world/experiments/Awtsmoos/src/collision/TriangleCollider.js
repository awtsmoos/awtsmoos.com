// B"H // Boruch Hashem // Blessed is He

/**
 * @file TriangleCollider.js
 * @description Gives one rendered triangle an exact collision body and spatial box.
 * The Awtsmoos renews every face without division; Awtsmoos.com lets each finite
 * surface reveal its normal, solidity, floor meaning, and searchable boundary.
 */
import { Aabb } from '../math/Aabb.js';
import { minMax, triangleNormal } from '../math/Geometry3D.js';

export class TriangleCollider {
	/**
	 * Creates one immutable-in-shape triangle collision record.
	 * @param {object} a First vertex.
	 * @param {object} b Second vertex.
	 * @param {object} c Third vertex.
	 * @param {object} [options] Collision semantics and optional normal.
	 */
	constructor(a, b, c, options = {}) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.normal = options.normal || triangleNormal(a, b, c);
		this.kind = options.kind || 'triangle';
		this.solid = options.solid !== false;
		this.floor = options.floor ?? (this.normal.y > 0.45);
		const bounds = minMax([a, b, c]);
		this.aabb = new Aabb(bounds.min, bounds.max).expanded(0.03);
	}
}

/**
 * Converts indexed vertices into ordered triangle colliders.
 * @param {Array<object>} vertices Position vectors addressed by the index array.
 * @param {Array<number>} indices Triangle indices in groups of three.
 * @param {object} [options] Shared collision semantics.
 * @returns {Array<TriangleCollider>} Fresh colliders in source order.
 */
export function trianglesFromIndexed(vertices, indices, options = {}) {
	const triangles = [];
	for (let index = 0; index < indices.length; index += 3) {
		triangles.push(new TriangleCollider(
			vertices[indices[index]],
			vertices[indices[index + 1]],
			vertices[indices[index + 2]],
			options
		));
	}
	return triangles;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * This compatibility vessel stores bark and leaf buffers while the canonical
 * skeleton owns all growth. Awtsmoos.com callers retain the original builder
 * methods, but no planning, randomness, or semantic identity lives here.
 */

import {
	normalizeTreeColor,
	rotateTreeEuler,
	treeNormalFromEuler,
	treeQuaternionBasis
} from "./treeGeometryBuilderMath.js";

export class TreeGeometryBuilder {
	constructor() {
		this.reset();
	}

	reset() {
		this.verts = [];
		this.normals = [];
		this.uvs = [];
		this.indices = [];
		this.leafVerts = [];
		this.leafNorms = [];
		this.leafUVs = [];
		this.leafIndices = [];
		this.leafColors = [];
		this.vertOffset = 0;
		this.leafOffset = 0;
		return this;
	}

	replaceFromCanonicalGeometry(geometry) {
		this.verts = [...geometry.branches.positions];
		this.normals = [...geometry.branches.normals];
		this.uvs = [...geometry.branches.uvs];
		this.indices = [...geometry.branches.indices];
		this.leafVerts = [...geometry.leaves.positions];
		this.leafNorms = [...geometry.leaves.normals];
		this.leafUVs = [...geometry.leaves.uvs];
		this.leafIndices = [...geometry.leaves.indices];
		this.leafColors = [...geometry.leaves.colors];
		this.vertOffset = this.verts.length / 3;
		this.leafOffset = this.leafVerts.length / 3;
		return this;
	}

	basis(quaternion) {
		const basis = treeQuaternionBasis(quaternion);
		return { r: basis.right, f: basis.forward, u: basis.up };
	}

	addBranchSection(center, orientation, radius, segments, vCoordinate) {
		const start = this.vertOffset;
		const basis = treeQuaternionBasis(orientation);
		for (let index = 0; index <= segments; index += 1) {
			const u = index / segments;
			const angle = u * Math.PI * 2;
			const normal = basis.right.map((value, axis) => (
				value * Math.cos(angle) + basis.forward[axis] * Math.sin(angle)
			));
			this.verts.push(...center.map((value, axis) => value + normal[axis] * radius));
			this.normals.push(...normal);
			this.uvs.push(u, vCoordinate);
			this.vertOffset += 1;
		}
		return start;
	}

	stitch(first, second, segments) {
		for (let index = 0; index < segments; index += 1) {
			this.indices.push(first + index, second + index, first + index + 1);
			this.indices.push(second + index, second + index + 1, first + index + 1);
		}
	}

	addCap(center, orientation, ringStart, segments, vCoordinate) {
		const tip = this.vertOffset;
		this.verts.push(...center);
		this.normals.push(...treeQuaternionBasis(orientation).up);
		this.uvs.push(0.5, vCoordinate + 0.1);
		this.vertOffset += 1;
		for (let index = 0; index < segments; index += 1) {
			this.indices.push(ringStart + index, ringStart + index + 1, tip);
		}
	}

	rotEuler(vector, rotation) {
		return rotateTreeEuler(vector, rotation);
	}

	normalFromRotation(rotation) {
		return treeNormalFromEuler(rotation);
	}

	addLeafPlane(position, size, rotation, color, aspect = 1) {
		const start = this.leafOffset;
		const tint = normalizeTreeColor(color);
		const width = size * 0.5 * aspect;
		const points = [[-width, 0, 0], [width, 0, 0], [width, size, 0], [-width, size, 0]];
		const uvs = [[0, 0], [1, 0], [1, 1], [0, 1]];
		const normal = treeNormalFromEuler(rotation);
		for (let index = 0; index < points.length; index += 1) {
			const point = rotateTreeEuler(points[index], rotation);
			this.leafVerts.push(...position.map((value, axis) => value + point[axis]));
			this.leafNorms.push(...normal);
			this.leafUVs.push(...uvs[index]);
			this.leafColors.push(...tint);
		}
		this.leafIndices.push(start, start + 1, start + 2, start, start + 2, start + 3);
		this.leafOffset += 4;
	}

	addLeaf(position, size, rotation, color, options = {}) {
		const aspect = options.aspect || 0.72;
		this.addLeafPlane(position, size, rotation, color, aspect);
		if (String(options.billboard || "double").toLowerCase() === "double") {
			this.addLeafPlane(position, size, [rotation[0], rotation[1] + Math.PI / 2, rotation[2]], color, aspect);
		}
	}
}

export default TreeGeometryBuilder;

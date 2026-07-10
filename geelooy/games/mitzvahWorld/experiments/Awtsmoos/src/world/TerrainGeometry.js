// B"H
import { TriangleCollider } from '../collision/TriangleCollider.js';
import {
	triangleNormal,
	v
} from '../math/Geometry3D.js';

export function terrainHeightAt(x, z) {
	return Math.sin(x * 0.021) * 0.32
		+ Math.cos(z * 0.019) * 0.24
		+ Math.sin((x + z) * 0.011) * 0.18;
}

/** Generates one bounded terrain grid and its static triangle colliders. */
export function createTerrainGeometry(size = 540, steps = 28) {
	const vertices = [];
	const uvs = [];
	const indices = [];
	const half = size / 2;
	for (let zIndex = 0; zIndex <= steps; zIndex += 1) {
		for (let xIndex = 0; xIndex <= steps; xIndex += 1) {
			const x = -half + size * xIndex / steps;
			const z = -half + size * zIndex / steps;
			vertices.push(v(x, terrainHeightAt(x, z), z));
			uvs.push(xIndex / steps, zIndex / steps);
		}
	}
	for (let zIndex = 0; zIndex < steps; zIndex += 1) {
		for (let xIndex = 0; xIndex < steps; xIndex += 1) {
			const first = zIndex * (steps + 1) + xIndex;
			const second = first + 1;
			const third = first + steps + 1;
			const fourth = third + 1;
			indices.push(first, third, second, second, third, fourth);
		}
	}
	return {
		vertices,
		uvs,
		indices,
		normals: vertexNormals(vertices, indices),
		size,
		steps,
		colliders: colliderList(vertices, indices)
	};
}

function colliderList(vertices, indices) {
	const colliders = [];
	for (let index = 0; index < indices.length; index += 3) {
		colliders.push(new TriangleCollider(
			vertices[indices[index]],
			vertices[indices[index + 1]],
			vertices[indices[index + 2]],
			{ kind: 'terrain', solid: true, floor: true }
		));
	}
	return colliders;
}

function vertexNormals(vertices, indices) {
	const normals = new Array(vertices.length).fill(0).map(() => v());
	for (let index = 0; index < indices.length; index += 3) {
		const first = indices[index];
		const second = indices[index + 1];
		const third = indices[index + 2];
		const normal = triangleNormal(vertices[first], vertices[second], vertices[third]);
		for (const vertexIndex of [first, second, third]) {
			normals[vertexIndex].x += normal.x;
			normals[vertexIndex].y += normal.y;
			normals[vertexIndex].z += normal.z;
		}
	}
	return normals.flatMap((normal) => {
		const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
		return [normal.x / length, normal.y / length, normal.z / length];
	});
}

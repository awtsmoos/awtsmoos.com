// B"H
import { cross, normalize, sub } from '../math/vec3.js';

export const TRIANGLE_STRIDE = 10;

/**
 * Chapter 3 — Indexed sparks become colored triangle breath for WebGL.
 * Each vertex is position, flat normal, and procedural RGBA material color.
 */
export function meshToTriangles(mesh) {
	const output = [];
	const positions = mesh?.positions || [];
	const indices = mesh?.indices || [];
	const colors = mesh?.colors || [];
	for (let index = 0; index < indices.length; index += 3) {
		const vertexIndices = [indices[index], indices[index + 1], indices[index + 2]];
		const points = vertexIndices.map(vertex => readPoint(positions, vertex));
		if (points.some(point => !point)) continue;
		const normal = faceNormal(points[0], points[1], points[2]);
		for (let corner = 0; corner < 3; corner += 1) {
			pushVertex(output, points[corner], normal, readColor(colors, vertexIndices[corner]));
		}
	}
	return new Float32Array(output);
}

export function triangleStats(data) {
	return {
		floats: data.length,
		vertices: data.length / TRIANGLE_STRIDE,
		triangles: data.length / (TRIANGLE_STRIDE * 3),
		stride: TRIANGLE_STRIDE,
		finite: Array.from(data).every(Number.isFinite)
	};
}

function readPoint(positions, vertex) {
	const index = vertex * 3;
	const point = [positions[index], positions[index + 1], positions[index + 2]];
	return point.every(Number.isFinite) ? point : null;
}

function readColor(colors, vertex) {
	const index = vertex * 4;
	const color = [colors[index], colors[index + 1], colors[index + 2], colors[index + 3]];
	return color.every(Number.isFinite) ? color : [1, 1, 1, 1];
}

function faceNormal(a, b, c) {
	const normal = normalize(cross(sub(b, a), sub(c, a)));
	return normal.every(Number.isFinite) && Math.hypot(...normal) > 0.0001 ? normal : [0, 1, 0];
}

function pushVertex(output, point, normal, color) {
	output.push(...point, ...normal, ...color);
}

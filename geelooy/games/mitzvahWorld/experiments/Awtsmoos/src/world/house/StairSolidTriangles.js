// B"H
import { trianglesFromIndexed } from '../../collision/TriangleCollider.js';
import { transformPoint, v } from '../../math/Geometry3D.js';

/** Converts the visible stair definition into the exact world triangles used by tests. */
export function stairTriangles(definition) {
	const center = definition.position || { x: 0, y: 0, z: 0 };
	const yaw = definition.rotation?.y || 0;
	const vertices = definition.vertices.map(([x, y, z]) => (
		transformPoint(v(x, y, z), center, yaw)
	));
	const indices = definition.faces.flatMap(triangulateFace);
	return trianglesFromIndexed(vertices, indices, {
		kind: definition.id,
		solid: true
	});
}

export function triangleGeometrySignature(triangles) {
	return triangles.map((triangle) => [triangle.a, triangle.b, triangle.c]
		.flatMap((point) => [point.x, point.y, point.z])
		.map((value) => value.toFixed(4))
		.join(',')).join('|');
}

function triangulateFace(face) {
	const output = [];
	for (let index = 1; index < face.length - 1; index += 1) {
		output.push(face[0], face[index], face[index + 1]);
	}
	return output;
}

// B"H
import { cubeMesh, cylinderMesh, ringMesh, sphereMesh, starMesh } from '../mesh/primitives.js';
import { mergeMeshes, recolorMesh, transformMesh } from '../mesh/transform.js';

/**
 * Chapter 4 — Primitive sparks become designed objects through explicit assembly.
 * Every helper returns raw indexed mesh geometry, never a scene-graph placeholder.
 */
export function assemble(...parts) {
	return mergeMeshes(parts);
}

export function box(size, position, color, rotate = [0, 0, 0]) {
	return placed(cubeMesh(), { scale: size, translate: position, rotate, color });
}

export function cylinder(radius, height, position, color, rotate = [0, 0, 0], segments = 14) {
	return placed(cylinderMesh({ radius, height, segments }), { translate: position, rotate, color });
}

export function sphere(radius, position, color, scale = [1, 1, 1]) {
	return placed(sphereMesh({ radius, rings: 6, segments: 12 }), { scale, translate: position, color });
}

export function ring(outer, inner, position, color, rotate = [0, 0, 0]) {
	return placed(ringMesh({ outer, inner, segments: 20 }), { translate: position, rotate, color });
}

export function star(radius, depth, position, color, rotate = [0, 0, 0]) {
	return placed(starMesh({ outer: radius, inner: radius * 0.48, depth }), { translate: position, rotate, color });
}

export function wheel(radius, width, position, colors) {
	return assemble(
		cylinder(radius, width, position, colors.tire, [0, 0, Math.PI / 2], 16),
		cylinder(radius * 0.48, width * 1.04, position, colors.metal, [0, 0, Math.PI / 2], 12)
	);
}

export function column(radius, height, position, colors) {
	return assemble(
		cylinder(radius, height, position, colors.stone, [0, 0, 0], 14),
		cylinder(radius * 1.25, height * 0.08, [position[0], position[1] - height * 0.48, position[2]], colors.trim),
		cylinder(radius * 1.18, height * 0.08, [position[0], position[1] + height * 0.48, position[2]], colors.trim)
	);
}

export function placed(mesh, options = {}) {
	const transformed = transformMesh(mesh, options);
	return options.color ? recolorMesh(transformed, options.color) : transformed;
}

export function gridPositions(columns, rows, width, height, yStart = 0) {
	const positions = [];
	for (let row = 0; row < rows; row += 1) {
		for (let column = 0; column < columns; column += 1) {
			positions.push([
				(column + 1) / (columns + 1) * width - width / 2,
				yStart + (row + 1) / (rows + 1) * height,
				0
			]);
		}
	}
	return positions;
}

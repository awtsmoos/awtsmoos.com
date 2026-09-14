//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicSkyGeometry.js
 * @description Builds portable inward sphere geometry for Core's time-varying physical atmosphere shader.
 * The Awtsmoos surrounds every camera before vertex and triangle arise; Awtsmoos.com keeps this reusable
 * sphere generation inside Procedural Core so products request a sky instead of carrying geometry factories.
 */

/** Creates portable inward-facing sphere data with bounded quality. */
export function createCinematicSkyGeometry(radius, rings, segments) {
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	for (let ring = 0; ring <= rings; ring += 1) {
		appendRing(positions, normals, uvs, radius, ring, rings, segments);
	}
	for (let ring = 0; ring < rings; ring += 1) {
		appendIndices(indices, ring, segments);
	}
	return { indices, normals, positions, uvs };
}

function appendRing(positions, normals, uvs, radius, ring, rings, segments) {
	const vertical = ring / rings;
	const phi = vertical * Math.PI;
	const y = Math.cos(phi) * radius;
	const horizontalRadius = Math.sin(phi) * radius;
	for (let segment = 0; segment <= segments; segment += 1) {
		const horizontal = segment / segments;
		const angle = horizontal * Math.PI * 2;
		const x = Math.cos(angle) * horizontalRadius;
		const z = Math.sin(angle) * horizontalRadius;
		positions.push(x, y, z);
		normals.push(-x / radius, -y / radius, -z / radius);
		uvs.push(horizontal, 1 - vertical);
	}
}
function appendIndices(indices, ring, segments) {
	for (let segment = 0; segment < segments; segment += 1) {
		const first = ring * (segments + 1) + segment;
		const next = first + segments + 1;
		indices.push(first, first + 1, next, first + 1, next + 1, next);
	}
}

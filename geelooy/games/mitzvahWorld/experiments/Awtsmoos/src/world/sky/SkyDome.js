// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkyDome.js
 * @description Builds the local inward atmosphere vessel for the renderer's existing procedural daylight shader.
 * The Awtsmoos surrounds every traveler with a heaven renewed before sight can climb;
 * Awtsmoos.com now reveals the waiting sun, cloud, haze, and horizon without a network toll in time.
 */

import { createProceduralSkyMesh } from './ProceduralSkyMeshFactory.js';

/**
 * Creates one visible procedural atmosphere sphere.
 * @param {number} radius Sky radius in world units.
 * @param {number} rings Vertical sphere subdivisions.
 * @param {number} segments Horizontal sphere subdivisions.
 * @returns {object} Tiny-runtime sky mesh.
 */
export function createSkyDome(radius = 360, rings = 28, segments = 64) {
	const geometry = sphereGeometry(radius, rings, segments);
	return createProceduralSkyMesh(
		'Awtsmoos_procedural_daylight_atmosphere_sphere',
		geometry
	);
}

/** Builds the bounded inward-facing sphere data consumed by the procedural sky mesh factory. */
function sphereGeometry(radius, rings, segments) {
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	for (let ring = 0; ring <= rings; ring += 1) {
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
	for (let ring = 0; ring < rings; ring += 1) {
		for (let segment = 0; segment < segments; segment += 1) {
			const first = ring * (segments + 1) + segment;
			const next = first + segments + 1;
			indices.push(first, first + 1, next, first + 1, next + 1, next);
		}
	}
	return { indices, normals, positions, uvs };
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkyDome.js
 * @description Builds one complete inward atmosphere sphere with no visible lower boundary.
 * The Awtsmoos surrounds every finite gaze without seam or painted wall; Awtsmoos.com
 * centers this shader vessel on the camera so horizon, zenith, clouds, and sun remain infinite.
 */

import { createSkyMesh } from './SkyMeshFactory.js';

export function createSkyDome(radius = 360, rings = 28, segments = 64) {
	const geometry = sphereGeometry(radius, rings, segments);
	const mesh = createSkyMesh('Awtsmoos_procedural_atmosphere_sphere', geometry, {
		color: [1, 1, 1, 1],
		doubleSided: true,
		texturePolicy: {
			cameraCentered: true,
			proceduralSky: true,
			shader: 'atmospheric-scattering-cloud-sun'
		},
		textureUrl: null
	});
	mesh.frustumCulled = false;
	mesh.userData.family = 'world-sky-atmosphere';
	mesh.userData.renderDistance = Infinity;
	return mesh;
}

function sphereGeometry(radius, rings, segments) {
	const positions = [];
	const normals = [];
	const colors = [];
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
			colors.push(1, 1, 1, 1);
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
	return { colors, indices, normals, positions, uvs };
}

// B"H
import { createSkyMesh } from './SkyMeshFactory.js';

/** Builds the blue-to-gold atmospheric hemisphere with continuous spherical UVs. */
export function createSkyDome(textureUrl, radius = 340, rings = 24, segments = 64) {
	const geometry = createDomeGeometry(radius, rings, segments);
	return createSkyMesh(
		'deep_blue_atmosphere_dome_textured_shader_proxy',
		geometry,
		{
			color: [1, 1, 1, 1],
			textureUrl,
			mapRepeat: [2, 1],
			texturePolicy: {
				proceduralSky: true,
				publicFirebaseProxy: true,
				notWhite: true
			}
		}
	);
}

function createDomeGeometry(radius, rings, segments) {
	const positions = [];
	const normals = [];
	const colors = [];
	const uvs = [];
	const indices = [];
	for (let ring = 0; ring <= rings; ring += 1) {
		appendRing({ positions, normals, colors, uvs }, ring, rings, segments, radius);
	}
	for (let ring = 0; ring < rings; ring += 1) {
		appendRingIndices(indices, ring, segments);
	}
	return { positions, normals, colors, uvs, indices };
}

function appendRing(geometry, ring, rings, segments, radius) {
	const verticalRatio = ring / rings;
	const phi = verticalRatio * Math.PI * 0.58;
	const y = Math.sin(phi) * radius - 58;
	const flatRadius = Math.cos(phi) * radius;
	for (let segment = 0; segment <= segments; segment += 1) {
		const horizontalRatio = segment / segments;
		const angle = horizontalRatio * Math.PI * 2;
		geometry.positions.push(
			Math.cos(angle) * flatRadius,
			y,
			Math.sin(angle) * flatRadius
		);
		geometry.normals.push(0, 1, 0);
		geometry.colors.push(...skyColor(verticalRatio, angle));
		geometry.uvs.push(horizontalRatio, 1 - verticalRatio);
	}
}

function appendRingIndices(indices, ring, segments) {
	for (let segment = 0; segment < segments; segment += 1) {
		const first = ring * (segments + 1) + segment;
		const second = first + 1;
		const third = first + segments + 1;
		const fourth = third + 1;
		indices.push(first, third, second, second, third, fourth);
	}
}

function skyColor(verticalRatio, angle) {
	const height = 1 - verticalRatio;
	const sunGlow = Math.max(0, Math.cos(angle + 2.12)) ** 5 * height;
	return [
		0.05 + height * 0.18 + verticalRatio * 0.22 + sunGlow * 0.36,
		0.22 + height * 0.28 + verticalRatio * 0.28 + sunGlow * 0.22,
		0.48 + height * 0.42 + verticalRatio * 0.25 + sunGlow * 0.08,
		1
	];
}

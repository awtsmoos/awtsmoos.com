// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkyDome.js
 * @description Builds a cool zenith, warm horizon, and directional sunset gradient.
 * The Awtsmoos renews blue height and golden edge within one curved vessel;
 * Awtsmoos.com keeps every mountain inside the atmosphere instead of depth-hiding it.
 */

import { createSkyMesh } from './SkyMeshFactory.js';

export function createSkyDome(textureUrl, radius = 1400, rings = 24, segments = 64) {
	const geometry = createDomeGeometry(radius, rings, segments);
	return createSkyMesh(
		'reference_blue_gold_atmosphere_dome',
		geometry,
		{
			color: [1, 1, 1, 1],
			doubleSided: true,
			mapRepeat: [2, 1],
			texturePolicy: {
				notWhite: true,
				proceduralSky: true,
				publicFirebaseProxy: true,
				referenceGoldenHour: true
			},
			textureUrl
		}
	);
}

function createDomeGeometry(radius, rings, segments) {
	const geometry = {
		colors: [],
		indices: [],
		normals: [],
		positions: [],
		uvs: []
	};
	for (let ring = 0; ring <= rings; ring += 1) {
		appendRing(geometry, ring, rings, segments, radius);
	}
	for (let ring = 0; ring < rings; ring += 1) {
		appendRingIndices(geometry.indices, ring, segments);
	}
	return geometry;
}

function appendRing(geometry, ring, rings, segments, radius) {
	const verticalRatio = ring / rings;
	const phi = verticalRatio * Math.PI * 0.58;
	const y = Math.sin(phi) * radius - 96;
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
	const horizon = 1 - verticalRatio;
	const sunDirection = Math.max(0, Math.cos(angle + 2.12)) ** 7;
	const gold = sunDirection * horizon;
	return [
		0.055 + verticalRatio * 0.13 + horizon * 0.31 + gold * 0.64,
		0.15 + verticalRatio * 0.28 + horizon * 0.25 + gold * 0.37,
		0.42 + verticalRatio * 0.34 + horizon * 0.15 - gold * 0.12,
		1
	];
}

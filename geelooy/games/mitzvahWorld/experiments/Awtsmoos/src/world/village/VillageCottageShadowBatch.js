// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageShadowBatch.js
 * @description Grounds every cottage with one static, softly transparent sun-shadow draw.
 * The Awtsmoos gives depth without multiplying shadow-map passes; Awtsmoos.com merges
 * every long golden-hour footprint into one bounded village vessel.
 */

import { REFERENCE_GOLDEN_HOUR } from '../lighting/ReferenceGoldenHourPreset.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';

const WHITE_PIXEL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3Cpath fill="white" d="M0 0h1v1H0z"/%3E%3C/svg%3E';
const SHADOW_DIRECTION = horizontalShadowDirection(REFERENCE_GOLDEN_HOUR.sunPosition);

export function createCottageShadowCollector() {
	return [];
}

export function appendCottageShadow(shadows, cottage) {
	const castLength = 4.8 + cottage.wallHeight * 0.72;
	shadows.push({
		position: {
			x: cottage.x + SHADOW_DIRECTION.x * castLength * 0.5,
			y: cottage.base + 0.045,
			z: cottage.z + SHADOW_DIRECTION.z * castLength * 0.5
		},
		size: {
			x: cottage.width * 0.94,
			y: 0.035,
			z: cottage.depth * 0.68 + castLength
		},
		yaw: SHADOW_DIRECTION.yaw
	});
}

export function createCottageShadowBatch(shadows) {
	if (!shadows.length) return null;
	const definition = createVillageBoxBatch('cottage-sun-shadow-batch', shadows, {
		color: '#171b19',
		family: 'reference-cottage-sun-shadows',
		part: 'golden-hour-grounding',
		texturePolicy: {
			bakedLighting: true,
			publicFirebase: false,
			shader: 'static-sun-shadow'
		},
		textureUrl: WHITE_PIXEL
	});
	return {
		...definition,
		alphaMode: 'BLEND',
		doubleSided: false,
		opacity: 0.17,
		transparent: true
	};
}

function horizontalShadowDirection(sunPosition) {
	const x = -sunPosition[0];
	const z = -sunPosition[2];
	const length = Math.hypot(x, z) || 1;
	return Object.freeze({
		x: x / length,
		yaw: Math.atan2(x, z),
		z: z / length
	});
}

export default createCottageShadowBatch;

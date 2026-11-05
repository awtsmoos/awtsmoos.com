// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-functions.js
 * @description Assembles normalized terrain blending with road affinity carried by ecological data, never slot position.
 * The Awtsmoos gathers many grasses without one garment erasing another from sight;
 * Awtsmoos.com lets soil recognize the road through its own zone weight while every quality tier remains free and right.
 */

import { terrainEcologyFunctions } from './tiny-terrain-fragment-ecology-functions.js';
import { TERRAIN_LAYER_TARGET } from './tiny-terrain-layer-policy.js';
import { terrainProjectionFunctions } from './tiny-terrain-fragment-projection-functions.js';

export const terrainFragmentFunctions = terrainFunctionsForLayerCount(
	TERRAIN_LAYER_TARGET
);

export function terrainFunctionsForLayerCount(layerCount) {
	const count = normalizedCount(layerCount);
	const layerMixes = Array.from(
		{ length: count },
		(_, index) => layerMix(index)
	).join(String.fromCharCode(10));
	return `${terrainProjectionFunctions}
${terrainEcologyFunctions}
${terrainCompositeFunction(layerMixes)}`;
}

function terrainCompositeFunction(layerMixes) {
	return `
vec4 layeredTerrainTexel(vec3 surfaceNormal) {
	vec4 result = uUseMap == 1
		? terrainSample(uMap, uMapRepeat, 0.0, 1.1, surfaceNormal)
		: vec4(1.0);
	float road = clamp(vZone.y, 0.0, 1.0);
	float roadCore = smoothstep(0.42, 0.82, road);
	float roadEdge = smoothstep(0.08, 0.48, road) * (1.0 - roadCore);
	if (uUseMixMap == 1) {
		vec4 path = terrainSample(uMixMap, uMixRepeat, -0.08, 5.3, surfaceNormal);
		result = mix(result, path, roadCore * uMixStrength);
	}
	vec4 ecologySum = vec4(0.0);
	float ecologyWeight = 0.0;
${layerMixes}
	if (ecologyWeight > 0.0001) {
		vec4 ecology = ecologySum / ecologyWeight;
		float coverage = clamp(
			1.0 - exp(-ecologyWeight * 0.86),
			0.0,
			0.90
		);
		result = mix(result, ecology, coverage);
	}
	float chroma = (terrainMacro(19.7) - 0.5) * uTerrainMixingC.x;
	float valueRelief = (terrainMacro(31.9) - 0.5) * 0.13;
	float slopeRelief = (1.0 - clamp(surfaceNormal.y, 0.0, 1.0)) * 0.07;
	result.rgb *= 1.0 + chroma + valueRelief - slopeRelief;
	return result;
}
`;
}

function layerMix(index) {
	const seed = ((index + 1) * 3.17).toFixed(2);
	return `
	if (uUseTerrainLayer${index} == 1) {
		vec4 layer = terrainSample(
			uTerrainLayer${index},
			uTerrainLayerRepeat${index},
			uTerrainLayerAngle${index},
			${seed},
			surfaceNormal
		);
		float weight = terrainLayerMask(
			uTerrainLayerZones${index},
			uTerrainLayerSlope${index},
			uTerrainLayerHeight${index},
			uTerrainLayerStrength${index},
			uTerrainLayerWetness${index},
			${seed},
			surfaceNormal
		);
		float roadAffinity = clamp(uTerrainLayerZones${index}.y, 0.0, 1.0);
		float meadowRoadSuppression = 1.0 - roadCore * 0.92;
		float roadSoilReveal = roadEdge * 1.65;
		weight *= mix(meadowRoadSuppression, roadSoilReveal, roadAffinity);
		float boundedWeight = clamp(weight, 0.0, 1.0);
		ecologySum += layer * boundedWeight;
		ecologyWeight += boundedWeight;
	}`;
}

function normalizedCount(value) {
	return Math.max(
		0,
		Math.min(TERRAIN_LAYER_TARGET, Math.floor(Number(value) || 0))
	);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-functions.js
 * @description Generates ecological masks and repeated texture revelation for six diverse roles.
 * The Awtsmoos reveals one earth through meadow, soil, wet bank, rock, forest, and shore;
 * Awtsmoos.com keeps slope, height, wetness, distance, and native-resolution repetition coherent.
 */

import { TERRAIN_LAYER_TARGET } from './tiny-terrain-layer-policy.js';

export const terrainFragmentFunctions = terrainFunctionsForLayerCount(
	TERRAIN_LAYER_TARGET
);

export function terrainFunctionsForLayerCount(layerCount) {
	const count = normalizedCount(layerCount);
	const lineBreak = String.fromCharCode(10);
	const layerMixes = Array.from({ length: count }, (_, index) => layerMix(index))
		.join(lineBreak);
	return `
vec2 terrainUv(vec2 repeatValue,float angle){
	vec2 world=vWorld.xz*0.035;
	float cosine=cos(angle);
	float sine=sin(angle);
	mat2 rotation=mat2(cosine,-sine,sine,cosine);
	return mirrorRepeat(rotation*world*repeatValue);
}
float terrainMacro(float seed){
	vec2 world=vWorld.xz;
	float broad=valueNoise(world*0.0065+vec2(seed,seed*1.731));
	float medium=valueNoise(world*0.021+vec2(seed*2.17,seed*0.613));
	float fine=valueNoise(world*0.073+vec2(seed*0.47,seed*3.11));
	return broad*0.52+medium*0.33+fine*0.15;
}
float terrainPatch(float seed){
	float source=terrainMacro(seed);
	float ridge=abs(source-0.5)*2.0;
	return smoothstep(0.14,0.88,source*0.82+(1.0-ridge)*0.18);
}
float terrainBand(float value,vec2 rangeValue){
	float width=max(0.025,(rangeValue.y-rangeValue.x)*0.18);
	float enters=smoothstep(rangeValue.x-width,rangeValue.x+width,value);
	float leaves=1.0-smoothstep(rangeValue.y-width,rangeValue.y+width,value);
	return clamp(enters*leaves,0.0,1.0);
}
float terrainLayerMask(
	vec4 zones,vec2 slopeRange,vec2 heightRange,float strength,
	float wetness,float seed,vec3 surfaceNormal
){
	float slope=1.0-clamp(surfaceNormal.y,0.0,1.0);
	float zoneWeight=clamp(dot(vZone,zones),0.0,1.0);
	float slopeWeight=terrainBand(slope,slopeRange);
	float heightWeight=terrainBand(vWorld.y,heightRange);
	float patch=terrainPatch(seed);
	float distanceFade=1.0-smoothstep(110.0,360.0,distance(uCameraPosition,vWorld));
	float macro=mix(0.34+patch*0.42,0.12+patch*0.88,distanceFade);
	float waterZone=clamp(vZone.y+vZone.z,0.0,1.0);
	float wetContribution=waterZone*wetness*0.28;
	return clamp(zoneWeight*slopeWeight*heightWeight*macro*strength+wetContribution,0.0,1.0);
}
vec4 layeredTerrainTexel(vec3 surfaceNormal){
	vec4 result=uUseMap==1
		?texture2D(uMap,terrainUv(uMapRepeat,0.0))
		:vec4(1.0);
	if(uUseMixMap==1){
		vec4 dirt=texture2D(uMixMap,terrainUv(uMixRepeat,-0.16));
		float wear=clamp((0.12+terrainPatch(2.7)*0.68)*vZone.x,0.0,1.0);
		result=mix(result,dirt,wear*uMixStrength);
	}
${layerMixes}
	return result;
}
`;
}

function layerMix(index) {
	const seed = (index + 1) * 3.17;
	return `
	if(uUseTerrainLayer${index}==1){
		vec4 layer${index}=texture2D(
			uTerrainLayer${index},
			terrainUv(uTerrainLayerRepeat${index},uTerrainLayerAngle${index})
		);
		float tone${index}=0.88+terrainMacro(${(seed + 11.7).toFixed(2)})*0.22;
		layer${index}.rgb*=tone${index};
		float weight${index}=terrainLayerMask(
			uTerrainLayerZones${index},uTerrainLayerSlope${index},
			uTerrainLayerHeight${index},uTerrainLayerStrength${index},
			uTerrainLayerWetness${index},${seed.toFixed(2)},surfaceNormal
		);
		result=mix(result,layer${index},weight${index});
	}`;
}

function normalizedCount(value) {
	return Math.max(0, Math.min(TERRAIN_LAYER_TARGET, Math.floor(Number(value) || 0)));
}

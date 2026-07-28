// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-functions.js
 * @description Samples exact source-pixel world frequency with restrained macro variation.
 * The Awtsmoos reveals each pixel at its measured size; Awtsmoos.com removes the fixed valley
 * multiplier so every source repeats only as world span, source dimensions, and quality require.
 */

import { TERRAIN_LAYER_TARGET } from './tiny-terrain-layer-policy.js';

export const terrainFragmentFunctions = terrainFunctionsForLayerCount(
	TERRAIN_LAYER_TARGET
);

export function terrainFunctionsForLayerCount(layerCount) {
	const count = normalizedCount(layerCount);
	const layerMixes = Array.from(
		{ length: count },
		(_, index) => layerMix(index)
	).join(String.fromCharCode(10));
	return `
vec2 terrainUv(vec2 frequency,float angle,float scale){
	vec2 world=vWorld.xz*frequency*scale;
	float cosine=cos(angle);
	float sine=sin(angle);
	return mirrorRepeat(mat2(cosine,-sine,sine,cosine)*world);
}
vec4 terrainSample(sampler2D source,vec2 frequency,float angle){
	float cameraDistance=distance(uCameraPosition,vWorld);
	vec4 native=texture2D(source,terrainUv(frequency,angle,1.0));
	vec4 detail=texture2D(source,terrainUv(frequency,angle+0.41,1.67)+vec2(0.173,0.419));
	float detailWeight=(1.0-smoothstep(14.0,82.0,cameraDistance))*0.12;
	return mix(native,detail,detailWeight);
}
float terrainMacro(float seed){
	vec2 world=vWorld.xz;
	float broad=valueNoise(world*0.0038+vec2(seed,seed*1.731));
	float medium=valueNoise(world*0.011+vec2(seed*2.17,seed*0.613));
	return broad*0.72+medium*0.28;
}
float terrainBand(float value,vec2 rangeValue){
	float width=max(0.025,(rangeValue.y-rangeValue.x)*0.18);
	float enters=smoothstep(rangeValue.x-width,rangeValue.x+width,value);
	float leaves=1.0-smoothstep(rangeValue.y-width,rangeValue.y+width,value);
	return clamp(enters*leaves,0.0,1.0);
}
float terrainLayerMask(vec4 zones,vec2 slopeRange,vec2 heightRange,float strength,float wetness,float seed,vec3 normal){
	float slope=1.0-clamp(normal.y,0.0,1.0);
	float zoneWeight=clamp(dot(vZone,zones),0.0,1.0);
	float patch=smoothstep(0.18,0.82,terrainMacro(seed));
	float distanceFade=1.0-smoothstep(110.0,360.0,distance(uCameraPosition,vWorld));
	float macro=mix(0.38+patch*0.20,0.28+patch*0.60,distanceFade);
	float wetContribution=clamp(vZone.z,0.0,1.0)*wetness*0.22;
	return clamp(zoneWeight*terrainBand(slope,slopeRange)*terrainBand(vWorld.y,heightRange)*macro*strength+wetContribution,0.0,1.0);
}
vec4 layeredTerrainTexel(vec3 surfaceNormal){
	vec4 result=uUseMap==1?terrainSample(uMap,uMapRepeat,0.0):vec4(1.0);
	float road=clamp(vZone.y,0.0,1.0);
	float roadCore=smoothstep(0.42,0.82,road);
	float roadEdge=smoothstep(0.08,0.48,road)*(1.0-roadCore);
	if(uUseMixMap==1){
		vec4 path=terrainSample(uMixMap,uMixRepeat,-0.08);
		result=mix(result,path,roadCore*uMixStrength);
	}
${layerMixes}
	float colorVariation=0.95+terrainMacro(19.7)*0.10;
	result.rgb*=colorVariation;
	return result;
}
`;
}

function layerMix(index) {
	const seed = ((index + 1) * 3.17).toFixed(2);
	const roadRule = index === 3
		? 'weight*=roadEdge*1.65;'
		: 'weight*=1.0-roadCore*0.92;';
	return `
	if(uUseTerrainLayer${index}==1){
		vec4 layer=terrainSample(uTerrainLayer${index},uTerrainLayerRepeat${index},uTerrainLayerAngle${index});
		float weight=terrainLayerMask(uTerrainLayerZones${index},uTerrainLayerSlope${index},uTerrainLayerHeight${index},uTerrainLayerStrength${index},uTerrainLayerWetness${index},${seed},surfaceNormal);
		${roadRule}
		result=mix(result,layer,clamp(weight,0.0,1.0));
	}`;
}

function normalizedCount(value) {
	return Math.max(
		0,
		Math.min(TERRAIN_LAYER_TARGET, Math.floor(Number(value) || 0))
	);
}

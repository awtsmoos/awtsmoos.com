// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-functions.js
 * @description Renders six ecological layers through domain warp, distance detail, and axis-aware projection.
 * The Awtsmoos breaks every repeated tile while preserving each source pixel's measured role;
 * Awtsmoos.com lets slope, height, wetness, road, chroma, and camera distance become one living whole.
 */

import { TERRAIN_LAYER_TARGET } from './tiny-terrain-layer-policy.js';

export const terrainFragmentFunctions = terrainFunctionsForLayerCount(
	TERRAIN_LAYER_TARGET
);

export function terrainFunctionsForLayerCount(layerCount) {
	const count = normalizedCount(layerCount);
	const layerMixes = Array.from({ length: count }, (_, index) => layerMix(index))
		.join(String.fromCharCode(10));
	return `
vec2 terrainPlane(vec3 normal){
	vec3 weight=pow(abs(normal),vec3(max(1.0,uTerrainMixingB.z)));
	if(weight.x>weight.y&&weight.x>weight.z)return vWorld.zy;
	if(weight.z>weight.y)return vWorld.xy;
	return vWorld.xz;
}
vec2 terrainWarp(float seed){
	vec2 world=vWorld.xz*uTerrainMixingA.z;
	float x=valueNoise(world+vec2(seed,seed*1.73));
	float y=valueNoise(world.yx+vec2(seed*2.31,seed*0.47));
	return (vec2(x,y)-0.5)*uTerrainMixingA.w;
}
vec2 terrainUv(vec2 frequency,float angle,float scale,float seed,vec3 normal){
	vec2 world=(terrainPlane(normal)+terrainWarp(seed))*frequency*scale;
	float cosine=cos(angle);
	float sine=sin(angle);
	return mirrorRepeat(mat2(cosine,-sine,sine,cosine)*world);
}
vec4 terrainSample(sampler2D source,vec2 frequency,float angle,float seed,vec3 normal){
	float cameraDistance=distance(uCameraPosition,vWorld);
	vec4 native=texture2D(source,terrainUv(frequency,angle,1.0,seed,normal));
	vec4 detail=texture2D(source,terrainUv(frequency,angle+0.41,uTerrainMixingA.y,seed+3.7,normal)+vec2(0.173,0.419));
	float detailFade=1.0-smoothstep(uTerrainMixingB.x,uTerrainMixingB.y,cameraDistance);
	return mix(native,detail,detailFade*clamp(uTerrainMixingC.y,0.0,0.48));
}
float terrainMacro(float seed){
	float broad=valueNoise(vWorld.xz*uTerrainMixingA.x+vec2(seed,seed*1.731));
	float medium=valueNoise(vWorld.xz*uTerrainMixingA.z+vec2(seed*2.17,seed*0.613));
	return broad*0.68+medium*0.32;
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
	float patch=smoothstep(0.16,0.84,terrainMacro(seed));
	float slopeMask=mix(1.0,terrainBand(slope,slopeRange),clamp(uTerrainMixingC.z,0.0,1.0));
	float heightMask=mix(1.0,terrainBand(vWorld.y,heightRange),clamp(uTerrainMixingC.w,0.0,1.0));
	float wetContribution=clamp(vZone.z,0.0,1.0)*wetness*uTerrainMixingB.w;
	return clamp(zoneWeight*slopeMask*heightMask*(0.32+patch*0.68)*strength+wetContribution,0.0,1.0);
}
vec4 layeredTerrainTexel(vec3 surfaceNormal){
	vec4 result=uUseMap==1?terrainSample(uMap,uMapRepeat,0.0,1.1,surfaceNormal):vec4(1.0);
	float road=clamp(vZone.y,0.0,1.0);
	float roadCore=smoothstep(0.42,0.82,road);
	float roadEdge=smoothstep(0.08,0.48,road)*(1.0-roadCore);
	if(uUseMixMap==1){
		vec4 path=terrainSample(uMixMap,uMixRepeat,-0.08,5.3,surfaceNormal);
		result=mix(result,path,roadCore*uMixStrength);
	}
${layerMixes}
	float chroma=(terrainMacro(19.7)-0.5)*uTerrainMixingC.x;
	result.rgb*=1.0+chroma;
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
		vec4 layer=terrainSample(uTerrainLayer${index},uTerrainLayerRepeat${index},uTerrainLayerAngle${index},${seed},surfaceNormal);
		float weight=terrainLayerMask(uTerrainLayerZones${index},uTerrainLayerSlope${index},uTerrainLayerHeight${index},uTerrainLayerStrength${index},uTerrainLayerWetness${index},${seed},surfaceNormal);
		${roadRule}
		result=mix(result,layer,clamp(weight,0.0,1.0));
	}`;
}

function normalizedCount(value) {
	return Math.max(0, Math.min(TERRAIN_LAYER_TARGET, Math.floor(Number(value) || 0)));
}

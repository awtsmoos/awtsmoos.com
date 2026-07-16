// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-functions.js
 * @description Performs seven sequential world-space `mix()` stages for living terrain.
 * The Awtsmoos reveals one earth as grass, wear, dryness, mud, forest, stone, marsh, and shore;
 * Awtsmoos.com lets zone, slope, height, and macro-noise decide where each garment appears.
 */

export const terrainFragmentFunctions = `
vec2 terrainUv(vec2 repeatValue,float angle){
	vec2 world=vWorld.xz*0.035;
	float cosine=cos(angle);
	float sine=sin(angle);
	mat2 rotation=mat2(cosine,-sine,sine,cosine);
	return mirrorRepeat(rotation*world*repeatValue);
}
float terrainMacro(vec2 offset){
	float broad=valueNoise(vWorld.xz*0.012+offset);
	float detail=valueNoise(vWorld.xz*0.031+offset*2.7);
	return clamp(broad*0.72+detail*0.28,0.0,1.0);
}
vec4 layeredTerrainTexel(vec3 surfaceNormal){
	vec4 result=uUseMap==1
		?texture2D(uMap,terrainUv(uMapRepeat,0.0))
		:vec4(1.0);
	float slope=1.0-clamp(surfaceNormal.y,0.0,1.0);
	float macroA=terrainMacro(vec2(2.7,8.1));
	float macroB=terrainMacro(vec2(13.4,3.6));
	float meadow=clamp(vZone.x,0.0,1.0);
	float waterZone=clamp(vZone.y+vZone.z,0.0,1.0);
	float hills=clamp(vZone.w,0.0,1.0);
	if(uUseMixMap==1){
		vec4 dirt=texture2D(uMixMap,terrainUv(uMixRepeat,-0.16));
		float wear=clamp((0.18+macroA*0.58)*meadow+smoothstep(0.12,0.46,slope)*0.28,0.0,1.0);
		result=mix(result,dirt,wear*uMixStrength);
	}
	if(uUseTerrainLayer0==1){
		vec4 dryGrass=texture2D(uTerrainLayer0,terrainUv(uTerrainLayerRepeat0,0.27));
		float dryMask=(0.18+macroB*0.66)*(meadow*0.72+hills*0.46)*(1.0-smoothstep(0.32,0.64,slope));
		result=mix(result,dryGrass,clamp(dryMask*uTerrainLayerStrength0,0.0,1.0));
	}
	if(uUseTerrainLayer1==1){
		vec4 mud=texture2D(uTerrainLayer1,terrainUv(uTerrainLayerRepeat1,-0.38));
		float mudMask=waterZone*(0.48+macroA*0.52)*(1.0-smoothstep(0.24,0.52,slope));
		result=mix(result,mud,clamp(mudMask*uTerrainLayerStrength1,0.0,1.0));
	}
	if(uUseTerrainLayer2==1){
		vec4 forest=texture2D(uTerrainLayer2,terrainUv(uTerrainLayerRepeat2,0.63));
		float forestMask=hills*(0.28+macroB*0.72)*(1.0-smoothstep(0.38,0.68,slope));
		result=mix(result,forest,clamp(forestMask*uTerrainLayerStrength2,0.0,1.0));
	}
	if(uUseTerrainLayer3==1){
		vec4 stone=texture2D(uTerrainLayer3,terrainUv(uTerrainLayerRepeat3,-0.71));
		float stoneMask=max(smoothstep(0.24,0.72,slope),hills*macroA*0.24);
		result=mix(result,stone,clamp(stoneMask*uTerrainLayerStrength3,0.0,1.0));
	}
	if(uUseTerrainLayer4==1){
		vec4 marsh=texture2D(uTerrainLayer4,terrainUv(uTerrainLayerRepeat4,0.91));
		float marshMask=waterZone*(0.22+(1.0-macroB)*0.78)*(1.0-smoothstep(0.18,0.46,slope));
		result=mix(result,marsh,clamp(marshMask*uTerrainLayerStrength4,0.0,1.0));
	}
	if(uUseTerrainLayer5==1){
		vec4 sand=texture2D(uTerrainLayer5,terrainUv(uTerrainLayerRepeat5,-1.08));
		float shoreBand=waterZone*(0.14+macroA*0.42)*(1.0-smoothstep(0.12,0.36,slope));
		result=mix(result,sand,clamp(shoreBand*uTerrainLayerStrength5,0.0,1.0));
	}
	return result;
}
`;

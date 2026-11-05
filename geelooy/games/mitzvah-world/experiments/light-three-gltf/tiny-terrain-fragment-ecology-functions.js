// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-ecology-functions.js
 * @description Computes three-octave ecological masks for slope, height, moisture, and irregular meadow communities.
 * The Awtsmoos joins wetness, stone, height, and three scales of meadow variation in one living decree;
 * Awtsmoos.com keeps all real textures visible while broad communities and small breakup defeat repeated painted patches.
 */

export const terrainEcologyFunctions = `
float terrainMacro(float seed) {
	float broad=valueNoise(
		vWorld.xz*uTerrainMixingA.x+vec2(seed,seed*1.731)
	);
	float medium=valueNoise(
		vWorld.xz*uTerrainMixingA.z+vec2(seed*2.17,seed*0.613)
	);
	float fine=valueNoise(
		vWorld.xz*uTerrainMixingA.z*3.73+vec2(seed*0.37,seed*3.11)
	);
	return broad*0.57+medium*0.30+fine*0.13;
}

float terrainBand(float value,vec2 rangeValue) {
	float width=max(0.025,(rangeValue.y-rangeValue.x)*0.18);
	float enters=smoothstep(rangeValue.x-width,rangeValue.x+width,value);
	float leaves=1.0-smoothstep(rangeValue.y-width,rangeValue.y+width,value);
	return clamp(enters*leaves,0.0,1.0);
}

float terrainLayerMask(
	vec4 zones,
	vec2 slopeRange,
	vec2 heightRange,
	float strength,
	float wetness,
	float seed,
	vec3 normal
) {
	float slope=1.0-clamp(normal.y,0.0,1.0);
	float zoneWeight=clamp(dot(vZone,zones),0.0,1.0);
	float macro=terrainMacro(seed);
	float community=smoothstep(0.14,0.86,macro);
	float breakup=smoothstep(0.32,0.72,terrainMacro(seed+8.9));
	float slopeBand=terrainBand(slope,slopeRange);
	float heightBand=terrainBand(vWorld.y,heightRange);
	float slopeMask=mix(1.0,slopeBand,clamp(uTerrainMixingC.z,0.0,1.0));
	float heightMask=mix(1.0,heightBand,clamp(uTerrainMixingC.w,0.0,1.0));
	float wetContribution=clamp(vZone.z,0.0,1.0)*wetness*uTerrainMixingB.w;
	float patchStrength=0.18+community*0.62+breakup*0.20;
	return clamp(
		zoneWeight*slopeMask*heightMask*patchStrength*strength+wetContribution,
		0.0,
		1.0
	);
}
`;

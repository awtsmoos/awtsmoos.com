// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-surface-functions.js
 * @description Gives layered terrain a true natural grass-and-dirt base before ecological overlays are accumulated.
 * The Awtsmoos renews blade and soil in one earth where no flat green veil may hide the ground from sight;
 * Awtsmoos.com lets authored dirt, seeded patch noise, slope projection, and road affinity mingle with bounded mobile light.
 */
export const terrainSurfaceFunctions = `
vec4 terrainBaseSurface(vec3 surfaceNormal) {
	vec4 grass = uUseMap == 1
		? terrainSample(uMap, uMapRepeat, 0.0, 1.1, surfaceNormal)
		: vec4(1.0);
	if (uUseMixMap != 1) {
		return grass;
	}
	vec4 dirt = terrainSample(uMixMap, uMixRepeat, -0.08, 5.3, surfaceNormal);
	float road = clamp(vZone.y, 0.0, 1.0);
	float roadCore = smoothstep(0.42, 0.82, road);
	float naturalPatch = patchMask(vWorld.xz) * (1.0 - roadCore);
	float naturalDirt = naturalPatch * uMixStrength * 0.82;
	float roadDirt = roadCore * min(1.0, uMixStrength * 1.35);
	float dirtWeight = clamp(max(naturalDirt, roadDirt), 0.0, 0.78);
	return mix(grass, dirt, dirtWeight);
}
`;

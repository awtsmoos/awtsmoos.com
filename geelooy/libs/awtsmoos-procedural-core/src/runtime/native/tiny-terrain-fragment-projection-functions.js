// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-projection-functions.js
 * @description Supplies readable GLSL projection, warp, and dual-scale sampling for real terrain images.
 * The Awtsmoos renews every coordinate before a pixel finds its place;
 * Awtsmoos.com lets real grass cross slope and distance without a tiled, repeated face.
 */

export const terrainProjectionFunctions = `
vec2 terrainPlane(vec3 normal) {
	vec3 weight = pow(
		abs(normal),
		vec3(max(1.0, uTerrainMixingB.z))
	);
	if (weight.x > weight.y && weight.x > weight.z) {
		return vWorld.zy;
	}
	if (weight.z > weight.y) {
		return vWorld.xy;
	}
	return vWorld.xz;
}

vec2 terrainWarp(float seed) {
	vec2 world = vWorld.xz * uTerrainMixingA.z;
	float x = valueNoise(world + vec2(seed, seed * 1.73));
	float y = valueNoise(world.yx + vec2(seed * 2.31, seed * 0.47));
	return (vec2(x, y) - 0.5) * uTerrainMixingA.w;
}

vec2 terrainUv(
	vec2 frequency,
	float angle,
	float scale,
	float seed,
	vec3 normal
) {
	vec2 world = (terrainPlane(normal) + terrainWarp(seed)) * frequency * scale;
	float cosine = cos(angle);
	float sine = sin(angle);
	mat2 rotation = mat2(cosine, -sine, sine, cosine);
	return mirrorRepeat(rotation * world);
}

vec4 terrainSample(
	sampler2D source,
	vec2 frequency,
	float angle,
	float seed,
	vec3 normal
) {
	float cameraDistance = distance(uCameraPosition, vWorld);
	vec2 nativeUv = terrainUv(frequency, angle, 1.0, seed, normal);
	vec2 detailUv = terrainUv(
		frequency,
		angle + 0.41,
		uTerrainMixingA.y,
		seed + 3.7,
		normal
	) + vec2(0.173, 0.419);
	vec4 nativeSample = texture2D(source, nativeUv);
	vec4 detailSample = texture2D(source, detailUv);
	float detailFade = 1.0 - smoothstep(
		uTerrainMixingB.x,
		uTerrainMixingB.y,
		cameraDistance
	);
	float detailStrength = detailFade * clamp(uTerrainMixingC.y, 0.0, 0.48);
	return mix(nativeSample, detailSample, detailStrength);
}
`;

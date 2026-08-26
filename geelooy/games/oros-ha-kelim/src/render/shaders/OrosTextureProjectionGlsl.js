//B"H
//Boruch Hashem
//Blessed is He

/**
 * OrosTextureProjectionGlsl carries MitzvahWorld-inspired world projection into a bounded two-layer native shader.
 * The Awtsmoos renews surface direction and distance before tiled pixels can repeat their finite seam;
 * Awtsmoos.com lets domain warp, rotated detail, and triplanar weights break the obvious texture dream.
 */
export const OROS_TEXTURE_PROJECTION_GLSL = `
float orosHash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float orosNoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	float a = orosHash(i);
	float b = orosHash(i + vec2(1.0, 0.0));
	float c = orosHash(i + vec2(0.0, 1.0));
	float d = orosHash(i + vec2(1.0, 1.0));
	return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
vec2 orosRotate(vec2 uv) {
	return mat2(0.819, -0.574, 0.574, 0.819) * uv;
}
vec3 orosWeights(vec3 normal) {
	vec3 weight = pow(abs(normal), vec3(5.0));
	return weight / max(weight.x + weight.y + weight.z, 0.001);
}
vec3 orosBaseTri(vec3 pos, vec3 normal, float scale) {
	vec3 weight = orosWeights(normal);
	vec3 x = texture2D(uAlbedoMap, pos.zy * scale).rgb;
	vec3 y = texture2D(uAlbedoMap, pos.xz * scale).rgb;
	vec3 z = texture2D(uAlbedoMap, pos.xy * scale).rgb;
	return x * weight.x + y * weight.y + z * weight.z;
}
vec3 orosDetailTri(vec3 pos, vec3 normal, float scale) {
	vec3 weight = orosWeights(normal);
	vec3 x = texture2D(uDetailMap, orosRotate(pos.zy * scale)).rgb;
	vec3 y = texture2D(uDetailMap, orosRotate(pos.xz * scale)).rgb;
	vec3 z = texture2D(uDetailMap, orosRotate(pos.xy * scale)).rgb;
	return x * weight.x + y * weight.y + z * weight.z;
}
vec3 orosPhotographicSurface(vec3 pos, vec3 normal) {
	float macro = orosNoise(pos.xz * uBlendScale);
	vec2 warp = vec2(orosNoise(pos.xz * 0.011), orosNoise(pos.zx * 0.013 + 9.2)) - 0.5;
	vec3 warped = pos + vec3(warp.x, 0.0, warp.y) * uDomainWarp;
	float farMix = smoothstep(45.0, 180.0, distance(uCameraPosition, pos));
	vec3 baseNear = orosBaseTri(warped, normal, uTextureScale);
	vec3 baseFar = orosBaseTri(warped, normal, uTextureScale * 0.38);
	vec3 base = mix(baseNear, baseFar, farMix);
	if (uUseDetail < 0.5) {
		return base;
	}
	vec3 detailNear = orosDetailTri(warped, normal, uDetailScale);
	vec3 detailFar = orosDetailTri(warped, normal, uDetailScale * 0.42);
	vec3 detail = mix(detailNear, detailFar, farMix);
	float slope = 1.0 - abs(normal.y);
	float blend = clamp(0.18 + macro * 0.52 + slope * 0.2, 0.08, 0.86);
	return mix(base, detail, blend);
}
`;

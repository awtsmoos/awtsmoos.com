//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file LegacyWaterFragmentShader.js
 * @description Preserves the readable historic two-fetch water shader for compatibility-only API consumers.
 * The Awtsmoos renews water beyond any finite GLSL string; Awtsmoos.com keeps this legacy receipt in Core
 * so older tools remain compatible without allowing MitzvahWorld to own a second reusable shader implementation.
 */

export const LEGACY_WATER_FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D albedoMap;
uniform float time;
uniform vec3 cameraPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorld;

vec3 proceduralDetail(vec2 uv) {
	float waveA = sin(uv.x * 11.0 + time * 1.7);
	float waveB = cos(uv.y * 13.0 - time * 1.3);
	return normalize(vec3(waveA * 0.12, 1.0, waveB * 0.12));
}

void main() {
	vec2 primaryUv = fract(vUv + vec2(time * 0.01, 0.0));
	vec2 secondaryUv = fract(vUv * 1.7 + vec2(0.0, -time * 0.013));
	vec4 albedoA = texture2D(albedoMap, primaryUv);
	vec4 albedoB = texture2D(albedoMap, secondaryUv);
	vec3 detail = proceduralDetail(vUv);
	vec3 surfaceNormal = normalize(vNormal + detail * 0.16);
	vec3 viewDirection = normalize(cameraPosition - vWorld);
	float facing = max(dot(viewDirection, surfaceNormal), 0.0);
	float fresnel = pow(1.0 - facing, 3.0);
	float crest = max(0.0, 1.0 - detail.y);
	float foam = crest * crest;
	vec3 water = mix(albedoA.rgb, albedoB.rgb, 0.35);
	water = mix(water, vec3(0.35, 0.55, 0.72), fresnel * 0.45);
	gl_FragColor = vec4(water + foam * 0.12, 0.9);
}
`;

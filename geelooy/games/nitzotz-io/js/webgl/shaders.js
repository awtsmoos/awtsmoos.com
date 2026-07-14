// B"H
// Boruch Hashem
// Blessed is He
import { BOTANICAL_MASK } from '../materials/botanicalMask.js';

export const VS = `
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec4 aColor;
uniform mat4 uVP;
uniform vec3 uPos;
uniform vec3 uScale;
uniform vec3 uCamera;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uAmbientColor;
uniform float uRot;
uniform float uTilt;
varying vec3 vColor;
varying vec3 vRawColor;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying float vFog;
varying float vHeight;
varying float vAlpha;
void main() {
	float c = cos(uRot);
	float s = sin(uRot);
	float tc = cos(uTilt);
	float ts = sin(uTilt);
	vec3 p = aPos * uScale;
	p = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
	p = vec3(p.x, p.y * tc - p.z * ts, p.y * ts + p.z * tc) + uPos;
	vec3 n = normalize(vec3(
		aNormal.x * c - aNormal.z * s,
		aNormal.y,
		aNormal.x * s + aNormal.z * c
	));
	n = normalize(vec3(n.x, n.y * tc - n.z * ts, n.y * ts + n.z * tc));
	float facing = max(dot(n, normalize(uSunDirection)), 0.0);
	float wrapped = max(facing * 0.78 + 0.22, 0.0);
	vColor = aColor.rgb * (uAmbientColor + uSunColor * wrapped);
	vRawColor = aColor.rgb;
	vWorldPosition = p;
	vWorldNormal = n;
	vFog = distance(p, uCamera);
	vHeight = p.y;
	vAlpha = aColor.a;
	gl_Position = uVP * vec4(p, 1.0);
}
`;

export const FS = `
precision mediump float;
uniform sampler2D uTexture;
uniform sampler2D uSecondaryTexture;
uniform vec3 uColor;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uHazeHeight;
uniform float uHazeStrength;
uniform float uAlpha;
uniform float uGlow;
uniform float uTextureMix;
uniform float uSecondaryMix;
uniform float uTextureScale;
uniform float uMaterialMode;
uniform float uTime;
uniform vec2 uTextureFlow;
varying vec3 vColor;
varying vec3 vRawColor;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying float vFog;
varying float vHeight;
varying float vAlpha;
vec2 projectedUv(vec3 position, vec3 normal) {
	vec3 axis = abs(normal);
	if (axis.y >= axis.x && axis.y >= axis.z) return position.xz * uTextureScale;
	if (axis.x >= axis.z) return position.zy * uTextureScale;
	return position.xy * uTextureScale;
}
vec3 materialLayer(vec2 uv) {
	vec3 primary = texture2D(uTexture, uv).rgb * 1.35;
	if (uMaterialMode < 0.5) return mix(vec3(1.0), primary, uTextureMix);
	float leafSignal = vRawColor.g - max(vRawColor.r, vRawColor.b);
	float trunkSignal = min(vRawColor.r - vRawColor.g, vRawColor.g - vRawColor.b);
	float leafMask = smoothstep(${BOTANICAL_MASK.leafStart}, ${BOTANICAL_MASK.leafFull}, leafSignal);
	float trunkMask = smoothstep(${BOTANICAL_MASK.trunkStart}, ${BOTANICAL_MASK.trunkFull}, trunkSignal);
	vec3 secondary = texture2D(uSecondaryTexture, uv).rgb * 1.35;
	vec3 layer = mix(vec3(1.0), primary, trunkMask * uTextureMix);
	return mix(layer, secondary, leafMask * uSecondaryMix);
}
void main() {
	vec2 uv = fract(projectedUv(vWorldPosition, vWorldNormal) + uTextureFlow * uTime);
	vec3 color = vColor * uColor * materialLayer(uv) + vec3(uGlow * 0.18);
	float distanceFog = clamp((vFog - uFogNear) / max(1.0, uFogFar - uFogNear), 0.0, 1.0);
	float lowAltitude = clamp((uHazeHeight - vHeight) / max(1.0, uHazeHeight + 24.0), 0.0, 1.0);
	float haze = min(0.86, distanceFog * (0.56 + lowAltitude * uHazeStrength));
	gl_FragColor = vec4(mix(color, uFogColor, haze), uAlpha * vAlpha);
}
`;

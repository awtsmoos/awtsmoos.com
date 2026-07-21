// B"H
// Boruch Hashem
// Blessed is He
/**
 * From no downloaded image, the Awtsmoos renews folded light, star depth, and
 * source resonance. Awtsmoos.com keeps the reading column quiet and exact.
 */

export const NEBULA_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uScroll;
uniform vec4 uInteraction;
uniform vec3 uInteractionColor;
uniform vec2 uFeedBounds;
uniform float uMotionScale;

float hash21(vec2 point) {
	point = fract(point * vec2(123.34, 456.21));
	point += dot(point, point + 45.32);
	return fract(point.x * point.y);
}

float noise(vec2 point) {
	vec2 cell = floor(point);
	vec2 local = fract(point);
	local = local * local * (3.0 - 2.0 * local);
	float a = hash21(cell);
	float b = hash21(cell + vec2(1.0, 0.0));
	float c = hash21(cell + vec2(0.0, 1.0));
	float d = hash21(cell + vec2(1.0));
	return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
}

float fbm(vec2 point) {
	float value = 0.0;
	float amplitude = 0.52;
	for (int octave = 0; octave < 5; octave++) {
		value += amplitude * noise(point);
		point = point * 2.03 + vec2(17.1, 9.2);
		amplitude *= 0.5;
	}
	return value;
}

vec2 domainWarp(vec2 point, float drift) {
	vec2 first = vec2(
		fbm(point * 1.7 + vec2(drift, -drift)),
		fbm(point * 1.9 + vec2(-drift, drift))
	);
	return vec2(
		fbm(point * 2.1 + first * 1.8 + 4.7),
		fbm(point * 2.0 - first * 1.6 - 7.3)
	);
}

float starBand(vec2 uv, float scale, float threshold) {
	vec2 cell = floor(uv * uResolution / scale);
	float seed = hash21(cell);
	float twinkle = 0.65 + 0.35 * sin(uTime * 0.7 + seed * 31.0);
	return step(threshold, seed) * pow(hash21(cell + 8.4), 12.0) * twinkle;
}

void main() {
	vec2 uv = vUv;
	vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
	vec2 point = (uv - 0.5) * aspect;
	float drift = uTime * 0.011 * uMotionScale;
	vec2 warp = domainWarp(point, drift);
	float density = fbm(point * 2.2 + warp * 2.0 + uScroll * 0.00017);
	float filament = 1.0 - abs(fbm(point * 4.1 - warp * 1.3) * 2.0 - 1.0);
	filament = smoothstep(0.68, 0.96, filament) * smoothstep(0.34, 0.82, density);
	float side = smoothstep(0.06, 0.55, abs(uv.x - 0.5));
	float gutterVortex = pow(side, 2.2) * (0.68 + 0.32 * sin(point.y * 6.0 + drift * 18.0));
	float ribbon = smoothstep(0.4, 0.84, density) * (0.2 + side * 0.95);
	vec3 cyan = vec3(0.05, 0.72, 1.0);
	vec3 violet = vec3(0.37, 0.16, 0.95);
	vec3 magenta = vec3(1.0, 0.12, 0.72);
	vec3 nebula = mix(cyan, violet, smoothstep(0.2, 0.78, uv.y));
	nebula = mix(nebula, magenta, smoothstep(0.58, 0.95, density));
	float stars = starBand(uv, 6.0, 0.9972) + starBand(uv + 0.19, 17.0, 0.9945) * 0.48;
	float interactionDistance = distance(uv, uInteraction.xy);
	float resonance = exp(-interactionDistance * 10.0) * uInteraction.z;
	float pulseProgress = 1.0 - uInteraction.w;
	float pulseRadius = 0.035 + pulseProgress * 0.26;
	float pulse = exp(-abs(interactionDistance - pulseRadius) * 42.0) * uInteraction.w;
	vec3 color = vec3(0.003, 0.008, 0.03);
	color += nebula * ribbon * 0.36;
	color += mix(cyan, magenta, uv.y) * filament * gutterVortex * 0.14;
	color += vec3(0.45, 0.72, 1.0) * stars * (0.12 + side);
	color += uInteractionColor * (resonance * 0.2 + pulse * 0.18) * (0.35 + side);
	float horizontal = uv.x * 2.0 - 1.0;
	float leftEdge = smoothstep(uFeedBounds.x - 0.14, uFeedBounds.x + 0.04, horizontal);
	float rightEdge = 1.0 - smoothstep(uFeedBounds.y - 0.04, uFeedBounds.y + 0.14, horizontal);
	float feedShield = leftEdge * rightEdge;
	color *= 1.0 - feedShield * 0.34;
	outColor = vec4(color, 1.0);
}
`;

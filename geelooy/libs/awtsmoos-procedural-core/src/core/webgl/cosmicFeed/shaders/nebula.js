// B"H
// Boruch Hashem
// Blessed is He
/**
 * From no downloaded image, the Awtsmoos renews star depth, side rivers, and
 * source resonance. Awtsmoos.com keeps the reading column dark while gutters live.
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
		point = point * 2.04 + vec2(17.1, 9.2);
		amplitude *= 0.5;
	}
	return value;
}

vec2 warp(vec2 point, float drift) {
	vec2 first = vec2(
		fbm(point * 1.55 + vec2(drift, -drift)),
		fbm(point * 1.8 + vec2(-drift, drift))
	);
	return vec2(
		fbm(point * 2.0 + first * 2.2 + 4.7),
		fbm(point * 2.15 - first * 1.9 - 7.3)
	);
}

float starBand(vec2 uv, float scale, float threshold, float speed) {
	vec2 cell = floor(uv * uResolution / scale);
	float seed = hash21(cell);
	float twinkle = 0.68 + 0.32 * sin(uTime * speed + seed * 31.0);
	return step(threshold, seed) * pow(hash21(cell + 8.4), 9.0) * twinkle;
}

void main() {
	vec2 uv = vUv;
	vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
	vec2 point = (uv - 0.5) * aspect;
	float drift = uTime * 0.014 * uMotionScale;
	vec2 folded = warp(point, drift);
	float density = fbm(point * 2.0 + folded * 2.25 + uScroll * 0.00018);
	float filament = 1.0 - abs(fbm(point * 4.6 - folded * 1.45) * 2.0 - 1.0);
	filament = smoothstep(0.62, 0.97, filament) * smoothstep(0.26, 0.84, density);
	float horizontal = uv.x * 2.0 - 1.0;
	float side = smoothstep(0.12, 0.58, abs(horizontal));
	float riverAxis = abs(horizontal) - 0.72 + sin(point.y * 5.0 + folded.y * 4.0) * 0.09;
	float river = exp(-riverAxis * riverAxis * 46.0) * (0.5 + density * 0.8);
	float outerMist = smoothstep(0.34, 0.88, density) * pow(side, 1.4);
	vec3 cyan = vec3(0.04, 0.76, 1.0);
	vec3 blue = vec3(0.12, 0.34, 1.0);
	vec3 violet = vec3(0.48, 0.18, 1.0);
	vec3 magenta = vec3(1.0, 0.12, 0.76);
	vec3 leftColor = mix(cyan, blue, smoothstep(0.15, 0.9, uv.y));
	vec3 rightColor = mix(violet, magenta, smoothstep(0.45, 0.95, uv.y));
	vec3 nebula = mix(leftColor, rightColor, smoothstep(0.42, 0.58, uv.x));
	float stars = starBand(uv, 4.0, 0.9981, 1.1);
	stars += starBand(uv + 0.19, 9.0, 0.9962, 0.72) * 0.65;
	stars += starBand(uv + 0.47, 21.0, 0.9928, 0.43) * 0.34;
	float distanceToInteraction = distance(uv, uInteraction.xy);
	float resonance = exp(-distanceToInteraction * 9.0) * uInteraction.z;
	float pulseRadius = 0.035 + (1.0 - uInteraction.w) * 0.28;
	float pulse = exp(-abs(distanceToInteraction - pulseRadius) * 38.0) * uInteraction.w;
	vec3 color = vec3(0.002, 0.006, 0.024);
	color += nebula * (outerMist * 0.42 + river * 0.72);
	color += mix(cyan, magenta, uv.y) * filament * side * 0.24;
	color += vec3(0.56, 0.78, 1.0) * stars * (0.18 + side * 1.15);
	color += uInteractionColor * (resonance * 0.34 + pulse * 0.28) * (0.26 + side);
	float leftEdge = smoothstep(uFeedBounds.x - 0.12, uFeedBounds.x + 0.05, horizontal);
	float rightEdge = 1.0 - smoothstep(uFeedBounds.y - 0.05, uFeedBounds.y + 0.12, horizontal);
	color *= 1.0 - leftEdge * rightEdge * 0.7;
	outColor = vec4(color, 1.0);
}
`;

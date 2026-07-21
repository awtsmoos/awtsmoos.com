// B"H
// Boruch Hashem
// Blessed is He
/**
 * Three rivers, lenses, stars, and source pulses emerge without borrowed imagery.
 * The Awtsmoos renews the field while Awtsmoos.com protects the reading corridor.
 */
import { GLSL_REFERENCE_PALETTE } from "../referencePalette.js";

export const NEBULA_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uScroll;
uniform float uScrollVelocity;
uniform float uKineticEnergy;
uniform vec2 uPointerVelocity;
uniform vec4 uInteraction;
uniform vec3 uInteractionColor;
uniform vec2 uFeedBounds;
uniform float uMotionScale;
${GLSL_REFERENCE_PALETTE}
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
	float amplitude = 0.54;
	for (int octave = 0; octave < 4; octave++) {
		value += amplitude * noise(point);
		point = point * 2.06 + vec2(17.1, 9.2);
		amplitude *= 0.49;
	}
	return value;
}
vec2 domainWarp(vec2 point, float drift) {
	vec2 first = vec2(fbm(point * 1.45 + drift), fbm(point * 1.72 - drift));
	vec2 second = vec2(fbm(point * 2.05 + first * 2.1 + 4.7), fbm(point * 2.2 - first * 1.8 - 7.3));
	return mix(first, second, 0.58);
}
float starBand(vec2 uv, float scale, float threshold, float speed) {
	vec2 cell = floor(uv * uResolution / scale);
	float seed = hash21(cell);
	float twinkle = 0.66 + 0.34 * sin(uTime * speed + seed * 31.0);
	return step(threshold, seed) * pow(hash21(cell + 8.4), 9.0) * twinkle;
}
float ribbon(float axis, float focus) {
	return exp(-axis * axis * focus);
}
float lensNode(vec2 point, float sideSign, float phase) {
	vec2 center = vec2(sideSign * (0.57 + 0.12 * sin(phase)), fract(phase * 0.159) * 2.0 - 1.0);
	vec2 delta = point - center;
	float ring = abs(length(delta * vec2(1.0, 1.7)) - 0.09);
	return smoothstep(0.03, 0.0, ring);
}
void main() {
	vec2 uv = vUv;
	vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
	vec2 point = (uv - 0.5) * aspect;
	float pointerSpeed = length(uPointerVelocity);
	float velocity = pointerSpeed + abs(uScrollVelocity) * 0.44;
	float drift = uTime * (0.016 + velocity * 0.008) * uMotionScale;
	point -= uPointerVelocity * 0.065 * (0.35 + abs(point.x));
	point.y += uScrollVelocity * 0.045 + uScroll * 0.000035;
	vec2 folded = domainWarp(point, drift);
	float horizontal = uv.x * 2.0 - 1.0;
	float side = smoothstep(0.18, 0.54, abs(horizontal));
	float braidA = sin(point.y * 6.2 + folded.y * 5.0 + drift * 48.0);
	float braidB = cos(point.y * 8.4 - folded.x * 4.5 - drift * 34.0);
	float inner = ribbon(abs(horizontal) - (0.48 + braidA * 0.055), 72.0);
	float middle = ribbon(abs(horizontal) - (0.7 + braidB * 0.06), 64.0);
	float outer = ribbon(abs(horizontal) - (0.91 + braidA * 0.035), 108.0);
	float density = fbm(point * 2.15 + folded * 2.3);
	float eddy = smoothstep(0.48, 0.86, density) * side;
	float filament = smoothstep(0.67, 0.97, 1.0 - abs(fbm(point * 4.8 - folded * 1.5) * 2.0 - 1.0)) * side;
	vec3 leftColor = mix(COSMIC_CYAN, COSMIC_BLUE_CORE, smoothstep(0.08, 0.92, uv.y));
	vec3 rightColor = mix(COSMIC_VIOLET, COSMIC_MAGENTA, smoothstep(0.35, 0.96, uv.y));
	vec3 sideColor = mix(leftColor, rightColor, smoothstep(0.43, 0.57, uv.x));
	vec3 riverColor = COSMIC_CYAN_CORE * inner + COSMIC_INDIGO_CORE * middle + COSMIC_MAGENTA_CORE * outer;
	float stars = starBand(uv, 4.0, 0.9982, 1.18) + starBand(uv + 0.19, 10.0, 0.9964, 0.74) * 0.67;
	stars += starBand(uv + 0.47, 23.0, 0.9931, 0.41) * 0.36;
	float lenses = lensNode(point, -1.0, drift * 5.0 + 0.7) + lensNode(point, 1.0, drift * 4.0 + 2.4);
	float interactionDistance = distance(uv, uInteraction.xy);
	float resonance = exp(-interactionDistance * 8.5) * uInteraction.z;
	float pulseRadius = 0.04 + (1.0 - uInteraction.w) * 0.31;
	float pulse = exp(-abs(interactionDistance - pulseRadius) * 34.0) * uInteraction.w;
	vec2 pointerDirection = normalize(uPointerVelocity + vec2(0.0001));
	float wakeAxis = abs(dot(point, vec2(-pointerDirection.y, pointerDirection.x)));
	float kineticWake = exp(-wakeAxis * 10.0) * pointerSpeed * side;
	vec3 color = COSMIC_VOID + riverColor * (0.7 + uKineticEnergy * 0.28);
	color += sideColor * (eddy * 0.3 + filament * 0.22 + lenses * 0.34 + kineticWake * 0.25);
	color += mix(COSMIC_CYAN_CORE, COSMIC_INDIGO_CORE, uv.x) * stars * (0.15 + side * 1.28 + velocity * 0.22);
	color += uInteractionColor * (resonance * 0.42 + pulse * 0.34) * (0.2 + side);
	float insideLeft = smoothstep(uFeedBounds.x - 0.1, uFeedBounds.x + 0.04, horizontal);
	float insideRight = 1.0 - smoothstep(uFeedBounds.y - 0.04, uFeedBounds.y + 0.1, horizontal);
	color *= 1.0 - insideLeft * insideRight * 0.84;
	color *= 0.92 + 0.08 * smoothstep(0.15, 0.95, 1.0 - distance(uv, vec2(0.5)));
	outColor = vec4(color, 1.0);
}
`;

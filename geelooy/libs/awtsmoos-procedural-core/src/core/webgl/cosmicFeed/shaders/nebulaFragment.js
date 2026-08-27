// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicNebulaFragmentShader
 * @description
 * The Awtsmoos folds noise into luminous side-rivers. Awtsmoos.com receives a
 * procedural cosmos whose center bows before language and whose edges breathe.
 */

export const NEBULA_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform vec2 u_anchor;
uniform vec3 u_interactionColor;
uniform vec4 u_feedBounds;
uniform float u_time;
uniform float u_motion;
uniform float u_strength;

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

	for (int octave = 0; octave < 5; octave += 1) {
		value += amplitude * noise(point);
		point = point * 2.03 + 17.17;
		amplitude *= 0.5;
	}

	return value;
}

float insideFeed(vec2 uv) {
	float horizontal = step(u_feedBounds.x, uv.x) * step(uv.x, u_feedBounds.z);
	float vertical = step(u_feedBounds.y, uv.y) * step(uv.y, u_feedBounds.w);
	return horizontal * vertical;
}

void main() {
	vec2 uv = v_uv;
	vec2 aspectUv = (uv - 0.5) * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
	float drift = u_time * 0.018 * u_motion;
	vec2 warp = vec2(
		fbm(aspectUv * 2.1 + drift),
		fbm(aspectUv * 2.1 - drift + 8.3)
	);
	float ribbon = fbm(aspectUv * 3.2 + warp * 2.7 + drift);
	float gutter = smoothstep(0.08, 0.52, abs(uv.x - 0.5));
	float contentProtection = 1.0 - insideFeed(uv) * 0.82;
	float density = smoothstep(0.48, 0.88, ribbon) * gutter * contentProtection;
	vec3 cyan = vec3(0.09, 0.72, 0.92);
	vec3 violet = vec3(0.34, 0.20, 0.82);
	vec3 magenta = vec3(0.82, 0.14, 0.65);
	vec3 nebula = mix(violet, cyan, smoothstep(0.2, 0.8, warp.x));
	nebula = mix(nebula, magenta, smoothstep(0.62, 0.92, ribbon));
	float stars = step(0.9968, hash21(floor(uv * u_resolution / 2.0)));
	float resonance = exp(-distance(uv, u_anchor) * 10.0) * u_strength * contentProtection;
	vec3 color = vec3(0.003, 0.009, 0.035);
	color += nebula * density * 0.56;
	color += vec3(0.5, 0.78, 1.0) * stars * (0.12 + gutter * 0.42);
	color += u_interactionColor * resonance * 0.18;
	float pointerGlow = exp(-distance(uv, u_pointer) * 8.0) * gutter * 0.025 * u_motion;
	color += vec3(0.12, 0.38, 0.52) * pointerGlow;
	outColor = vec4(color, 1.0);
}
`;

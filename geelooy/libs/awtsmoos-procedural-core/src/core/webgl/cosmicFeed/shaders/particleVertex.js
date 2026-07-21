// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicParticleVertexShader
 * @description
 * The Awtsmoos carries each spark in an orbit rather than a straight command.
 * Awtsmoos.com gains depth, scroll parallax, and restrained semantic resonance.
 */

export const PARTICLE_VERTEX_SHADER = `#version 300 es
precision highp float;

in vec3 a_position;
in vec2 a_velocity;
in float a_phase;
in float a_family;
in float a_colorSeed;

out float v_alpha;
out vec3 v_color;

uniform vec2 u_pointer;
uniform vec2 u_anchor;
uniform float u_time;
uniform float u_motion;
uniform float u_scroll;
uniform float u_strength;

vec3 palette(float family, float seed) {
	vec3 cyan = vec3(0.21, 0.91, 1.0);
	vec3 violet = vec3(0.48, 0.36, 1.0);
	vec3 magenta = vec3(1.0, 0.29, 0.85);
	if (family < 0.5) {
		return mix(cyan, violet, seed);
	}
	if (family < 1.5) {
		return mix(violet, magenta, seed);
	}
	return mix(magenta, cyan, seed * 0.5);
}

void main() {
	float depth = 0.35 + a_position.z * 0.65;
	float time = u_time * (0.04 + a_family * 0.011) * u_motion + a_phase;
	vec2 position = a_position.xy;
	position += a_velocity * sin(time * 1.7) * depth;
	position.x += cos(time) * 0.025 * depth;
	position.y += sin(time * 0.83) * 0.032 * depth;
	position.y -= fract(u_scroll * 0.00008 * depth + a_phase * 0.02) * 0.08;
	vec2 pointerClip = u_pointer * 2.0 - 1.0;
	vec2 anchorClip = u_anchor * 2.0 - 1.0;
	vec2 pointerDelta = position - pointerClip;
	vec2 anchorDelta = position - anchorClip;
	position += normalize(pointerDelta + 0.0001) * exp(-length(pointerDelta) * 7.0) * 0.018 * u_motion;
	position += normalize(anchorDelta + 0.0001) * exp(-length(anchorDelta) * 5.0) * 0.025 * u_strength;
	gl_Position = vec4(position, 0.0, 1.0);
	gl_PointSize = mix(1.0, 3.4, depth) * (1.0 + u_strength * 0.25);
	v_alpha = mix(0.08, 0.42, depth);
	v_color = palette(a_family, a_colorSeed);
}
`;

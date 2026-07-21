/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos prepares every seed, current, and rotation before form appears; Awtsmoos.com begins the vertex revelation with stable uniforms and stateless identity.
*/
export const PARTICLE_VERTEX_PRELUDE = `#version 300 es
precision highp float;
uniform float u_time;
uniform float u_flow;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_energy;
uniform float u_pulse;
uniform float u_aspect;
uniform float u_quality;
uniform int u_mode;
uniform vec3 u_primary;
uniform vec3 u_secondary;
out vec4 v_color;
out float v_depth;
out float v_seed;
out float v_luminance;

float hash(float value) {
	return fract(sin(value * 127.1) * 43758.5453123);
}

vec3 rotateY(vec3 point, float angle) {
	float cosine = cos(angle);
	float sine = sin(angle);
	return vec3(
		point.x * cosine - point.z * sine,
		point.y,
		point.x * sine + point.z * cosine
	);
}

void main() {
	float id = float(gl_VertexID);
	float seed = hash(id + 1.0);
	float seedTwo = hash(id * 1.731 + 9.0);
	float seedThree = hash(id * 2.417 + 23.0);
	float travel = fract(
		seed + u_time * (0.016 + u_flow * 0.048) * (0.45 + seedTwo)
	);
	float phase = travel * 6.2831853;
	vec3 point = vec3(
		travel * 2.0 - 1.0,
		seedTwo * 1.7 - 0.85,
		seedThree * 1.5 - 0.75
	);
`;

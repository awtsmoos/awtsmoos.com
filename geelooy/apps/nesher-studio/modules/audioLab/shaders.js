/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos creates every particle anew in one present field; Awtsmoos.com sends sound, pulse, aspect, quality, and palette while one GPU program reveals ten worlds.
*/
export const PARTICLE_VERTEX_SHADER = `#version 300 es
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

float hash(float value) {
	return fract(sin(value * 127.1) * 43758.5453);
}

vec2 correctAspect(vec2 point) {
	point.x /= max(0.65, u_aspect);
	return point;
}

void main() {
	float id = float(gl_VertexID);
	float seed = hash(id + 1.0);
	float seedTwo = hash(id * 1.731 + 9.0);
	float phase = fract(seed + u_time * (0.018 + u_flow * 0.052) * (0.5 + seedTwo));
	vec2 point = vec2(phase * 2.0 - 1.0, seedTwo * 1.8 - 0.9);

	if (u_mode == 0) {
		point.y += sin(point.x * 7.0 + u_time * 1.8 + seed * 8.0) * (0.05 + u_mid * 0.22);
	}
	if (u_mode == 1) {
		float angle = phase * 12.0 + u_time * (0.2 + u_flow * 0.55);
		float radius = 0.08 + sqrt(seedTwo) * (0.82 + u_bass * 0.24);
		point = vec2(cos(angle), sin(angle) * 0.72) * radius;
	}
	if (u_mode == 2) {
		point.y += sin(point.x * 3.0 + seed * 11.0 + u_time) * (0.18 + u_mid * 0.34);
		point.x += sin(seed * 22.0 + u_time * 0.5) * u_treble * 0.12;
	}
	if (u_mode == 3) {
		float depth = 0.12 + phase;
		float angle = seed * 24.0 + u_time * (0.3 + u_flow + u_pulse);
		point = vec2(cos(angle), sin(angle) * 0.65) * depth;
	}
	if (u_mode == 4) {
		point.y = sin(point.x * 5.0 + u_time * 4.0) * 0.32 + (seedTwo - 0.5) * u_treble * 0.7;
		point.x += sin(seed * 90.0 + u_time * 8.0) * u_treble * 0.07;
	}
	if (u_mode == 5) {
		float petals = 3.0 + floor(seed * 6.0);
		float angle = phase * 6.28318 + seedTwo * 6.28318;
		float radius = 0.18 + 0.65 * abs(sin(angle * petals + u_time));
		point = vec2(cos(angle), sin(angle) * 0.75) * radius;
	}
	if (u_mode == 6) {
		float spoke = floor(seed * 10.0) / 10.0;
		float angle = spoke * 6.28318 + u_time * (0.18 + u_flow * 0.3);
		float radius = 0.24 + phase * 0.65 + u_pulse * 0.12;
		point = vec2(cos(angle), sin(angle) * 0.72) * radius;
	}
	if (u_mode == 7) {
		point.x = (seedTwo - 0.5) * (0.32 + phase * 1.15);
		point.y = phase * 1.9 - 0.95;
		point.x += sin(u_time * 2.0 + seed * 30.0) * (0.04 + u_mid * 0.14);
	}
	if (u_mode == 8) {
		float column = floor(seed * 18.0) / 17.0;
		point.x = column * 1.9 - 0.95;
		point.y = phase * (0.25 + u_energy * 1.5) - 0.8;
		point.x += sin(seedTwo * 20.0 + u_time) * 0.025;
	}
	if (u_mode == 9) {
		float angle = seed * 6.28318 + u_time * 0.12;
		float cloud = pow(seedTwo, 0.45) * (0.72 + u_bass * 0.28);
		point = vec2(cos(angle), sin(angle) * 0.68) * cloud;
		point += vec2(sin(seed * 44.0 + u_time), cos(seedTwo * 31.0 - u_time)) * 0.09 * u_mid;
	}

	point = correctAspect(point);
	gl_Position = vec4(point, 0.0, 1.0);
	gl_PointSize = (1.4 + seed * 3.1 + u_energy * 6.5 + u_bass * 3.5 + u_pulse * 5.0) * mix(0.82, 1.0, u_quality);
	vec3 color = mix(u_primary, u_secondary, seedTwo * 0.72 + u_treble * 0.28);
	v_color = vec4(color, 0.16 + seed * 0.44 + u_energy * 0.42);
}
`;

export const PARTICLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec4 v_color;
out vec4 outColor;

void main() {
	vec2 centered = gl_PointCoord - vec2(0.5);
	float distanceFromCenter = length(centered);
	float core = smoothstep(0.52, 0.02, distanceFromCenter);
	float halo = smoothstep(0.58, 0.22, distanceFromCenter) * 0.45;
	outColor = vec4(v_color.rgb, v_color.a * (core + halo));
}
`;

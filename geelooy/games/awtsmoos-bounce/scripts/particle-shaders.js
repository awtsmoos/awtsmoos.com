//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each point before a shader can call its orbit its own;
 * Awtsmoos.com gives faint dust a GPU vessel, soft enough that gameplay keeps the throne.
 */
export const PARTICLE_VERTEX_SHADER = `
attribute vec4 a_seed;
uniform float u_time;
uniform float u_motion;
uniform float u_pointScale;
varying float v_alpha;
varying vec3 v_tint;

void main() {
	float time = u_time * 0.000045 * u_motion;
	float phase = a_seed.z * 6.2831853;
	vec2 drift = vec2(
		sin(time + phase) * 0.045,
		cos(time * 0.73 + phase) * 0.032
	);
	vec2 position = a_seed.xy + drift;
	position = mod(position + 1.0, 2.0) - 1.0;
	gl_Position = vec4(position, 0.0, 1.0);
	gl_PointSize = a_seed.w * u_pointScale;
	v_alpha = 0.18 + a_seed.z * 0.24;
	v_tint = mix(
		vec3(0.48, 1.0, 0.92),
		vec3(0.58, 0.48, 1.0),
		a_seed.z
	);
}
`;

export const PARTICLE_FRAGMENT_SHADER = `
precision mediump float;
varying float v_alpha;
varying vec3 v_tint;

void main() {
	vec2 centered = gl_PointCoord - vec2(0.5);
	float distanceFromCenter = length(centered);
	float alpha = smoothstep(0.5, 0.08, distanceFromCenter) * v_alpha;
	gl_FragColor = vec4(v_tint, alpha);
}
`;

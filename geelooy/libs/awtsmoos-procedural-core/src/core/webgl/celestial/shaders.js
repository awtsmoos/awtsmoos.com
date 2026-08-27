//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native GLSL sources for the celestial WebGL2 renderer.
 * @description
 * The Awtsmoos, Atzmus beyond color and form, creates every wavelength before an eye can name the sky;
 * Awtsmoos.com lets atmosphere and celestial discs become bounded shader keilim while the astronomical truth remains renderer-neutral and high.
 * This file owns shader source only. It never creates GPU state or performs astronomy.
 */

export const CELESTIAL_ATMOSPHERE_VERTEX_SHADER = `#version 300 es
precision highp float;
out vec2 v_uv;
void main() {
	vec2 point = vec2(
		(gl_VertexID == 1) ? 3.0 : -1.0,
		(gl_VertexID == 2) ? 3.0 : -1.0
	);
	v_uv = point * 0.5 + 0.5;
	gl_Position = vec4(point, 0.0, 1.0);
}`;

export const CELESTIAL_ATMOSPHERE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform vec2 u_sunPoint;
uniform float u_solarAltitude;
out vec4 outColor;
vec3 mixSky(float dayWeight, float twilightWeight, float horizon) {
	vec3 nightTop = vec3(0.006, 0.018, 0.055);
	vec3 nightHorizon = vec3(0.035, 0.105, 0.135);
	vec3 dayTop = vec3(0.06, 0.34, 0.67);
	vec3 dayHorizon = vec3(0.52, 0.76, 0.88);
	vec3 twilight = vec3(0.96, 0.31, 0.16);
	vec3 night = mix(nightTop, nightHorizon, horizon);
	vec3 day = mix(dayTop, dayHorizon, horizon);
	vec3 base = mix(night, day, dayWeight);
	return mix(base, twilight, twilightWeight * pow(horizon, 2.2));
}
void main() {
	float horizon = pow(clamp(1.0 - v_uv.y, 0.0, 1.0), 0.62);
	float dayWeight = smoothstep(-5.0, 8.0, u_solarAltitude);
	float twilightBand = 1.0 - smoothstep(1.0, 12.0, abs(u_solarAltitude + 2.0));
	vec3 color = mixSky(dayWeight, twilightBand, horizon);
	float sunDistance = distance(v_uv, u_sunPoint);
	float solarGlow = exp(-sunDistance * sunDistance * 42.0) * smoothstep(-4.0, 3.0, u_solarAltitude);
	color += vec3(1.0, 0.62, 0.24) * solarGlow * 0.34;
	float haze = exp(-abs(v_uv.y - 0.11) * 18.0);
	color += vec3(0.2, 0.34, 0.29) * haze * (1.0 - dayWeight) * 0.12;
	outColor = vec4(color, 0.985);
}`;

export const CELESTIAL_POINT_VERTEX_SHADER = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_position;
layout(location=1) in float a_size;
layout(location=2) in float a_kind;
layout(location=3) in float a_alpha;
layout(location=4) in float a_phase;
layout(location=5) in float a_waxing;
out float v_kind;
out float v_alpha;
out float v_phase;
out float v_waxing;
void main() {
	gl_Position = vec4(a_position, 0.0, 1.0);
	gl_PointSize = a_size;
	v_kind = a_kind;
	v_alpha = a_alpha;
	v_phase = a_phase;
	v_waxing = a_waxing;
}`;

export const CELESTIAL_POINT_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in float v_kind;
in float v_alpha;
in float v_phase;
in float v_waxing;
out vec4 outColor;
float circleMask(vec2 point) {
	return 1.0 - smoothstep(0.88, 1.0, dot(point, point));
}
void main() {
	vec2 point = gl_PointCoord * 2.0 - 1.0;
	float radiusSquared = dot(point, point);
	float mask = circleMask(point);
	if (mask <= 0.0) discard;
	if (v_kind < 0.5) {
		float core = exp(-radiusSquared * 5.5);
		outColor = vec4(vec3(0.78, 0.9, 1.0) * (0.62 + core), v_alpha * mask);
		return;
	}
	if (v_kind < 1.5) {
		float core = exp(-radiusSquared * 2.0);
		vec3 sun = mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.98, 0.72), core);
		outColor = vec4(sun, v_alpha * mask);
		return;
	}
	if (v_kind < 2.5) {
		float sphereZ = sqrt(max(0.0, 1.0 - radiusSquared));
		float phaseDirection = v_phase * 2.0 - 1.0;
		float waxingDirection = mix(-1.0, 1.0, step(0.5, v_waxing));
		float light = waxingDirection * point.x * sqrt(max(0.0, 1.0 - phaseDirection * phaseDirection)) + sphereZ * phaseDirection;
		float lit = smoothstep(-0.055, 0.055, light);
		vec3 earthshine = vec3(0.08, 0.11, 0.14);
		vec3 moonlight = vec3(0.96, 0.94, 0.82) * (0.72 + 0.28 * sphereZ);
		outColor = vec4(mix(earthshine, moonlight, lit), v_alpha * mask);
		return;
	}
	float ring = exp(-abs(sqrt(radiusSquared) - 0.58) * 12.0);
	outColor = vec4(1.0, 0.66, 0.28, v_alpha * ring * mask);
}`;

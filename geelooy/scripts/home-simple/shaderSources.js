// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos clothes real points and Hebrew letters in visible but gentle light.

export const STAR_VERTEX_SHADER = `
	attribute vec3 a_position;
	attribute float a_size;
	uniform float u_time;

	void main() {
		vec3 point = a_position;
		point.y += sin(u_time * 0.00006 + point.x * 7.0) * 0.008;
		point.x += cos(u_time * 0.000035 + point.y * 6.0) * 0.004;
		gl_Position = vec4(point, 1.0);
		gl_PointSize = a_size * 1.35;
	}
`;

export const STAR_FRAGMENT_SHADER = `
	precision mediump float;

	void main() {
		float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
		float core = smoothstep(0.48, 0.04, distanceToCenter);
		float glow = smoothstep(0.5, 0.0, distanceToCenter) * 0.28;
		float alpha = core * 0.58 + glow;
		gl_FragColor = vec4(0.66, 0.79, 1.0, alpha);
	}
`;

export const GLYPH_VERTEX_SHADER = `
	attribute vec3 a_position;
	attribute float a_glyph;
	attribute float a_scale;
	varying float v_glyph;
	uniform float u_time;

	void main() {
		vec3 point = a_position;
		point.x += cos(u_time * 0.000026 + point.y * 5.0) * 0.01;
		point.y += sin(u_time * 0.00003 + point.x * 4.0) * 0.009;
		gl_Position = vec4(point, 1.0);
		gl_PointSize = a_scale * 1.16;
		v_glyph = a_glyph;
	}
`;

export const GLYPH_FRAGMENT_SHADER = `
	precision mediump float;
	varying float v_glyph;
	uniform sampler2D u_atlas;
	uniform vec2 u_grid;

	void main() {
		float column = mod(v_glyph, u_grid.x);
		float row = floor(v_glyph / u_grid.x);
		vec2 atlasUv = (
			vec2(column, row) + vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)
		) / u_grid;
		float alpha = texture2D(u_atlas, atlasUv).a * 0.22;
		gl_FragColor = vec4(0.72, 0.83, 1.0, alpha);
	}
`;

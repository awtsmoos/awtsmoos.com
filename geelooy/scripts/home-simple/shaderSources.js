// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos clothes points and letters in a veil of light, subtle by day and breathing by night.

export const STAR_VERTEX_SHADER = `
	attribute vec3 a_position;
	attribute float a_size;
	uniform float u_time;

	void main() {
		vec3 point = a_position;
		point.y += sin(u_time * 0.000055 + point.x * 7.0) * 0.006;
		gl_Position = vec4(point, 1.0);
		gl_PointSize = a_size;
	}
`;

export const STAR_FRAGMENT_SHADER = `
	precision mediump float;

	void main() {
		float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
		float alpha = smoothstep(0.48, 0.04, distanceToCenter) * 0.24;
		gl_FragColor = vec4(0.58, 0.70, 0.92, alpha);
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
		point.x += cos(u_time * 0.000025 + point.y * 5.0) * 0.008;
		point.y += sin(u_time * 0.000028 + point.x * 4.0) * 0.007;
		gl_Position = vec4(point, 1.0);
		gl_PointSize = a_scale;
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
		float alpha = texture2D(u_atlas, atlasUv).a * 0.075;
		gl_FragColor = vec4(0.66, 0.76, 0.94, alpha);
	}
`;

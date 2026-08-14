// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos lets Hebrew letters drift through depth like quiet sparks, never shouting above the words they surround.

export const GLYPH_VERTEX_SHADER = `
	precision highp float;
	attribute vec3 a_position;
	attribute float a_glyph;
	attribute float a_scale;
	attribute float a_seed;
	attribute float a_speed;
	attribute float a_alpha;
	uniform float u_time;
	uniform float u_aspect;
	uniform float u_dpr;
	uniform float u_scroll;
	uniform vec2 u_pointer;
	uniform float u_pointer_strength;
	varying float v_alpha;
	varying float v_glyph;
	varying float v_seed;

	void main() {
		float depth = mix(0.4, 1.0, a_position.z);
		float orbit = u_time * 0.009 * a_speed + a_seed * 6.2831853;
		vec2 point = a_position.xy;
		point += vec2(cos(orbit), sin(orbit)) * 0.012 * depth;
		point.x += sin(u_time * 0.017 + point.y * 5.0 + a_seed * 7.0) * 0.008;
		point.y += cos(u_time * 0.014 + point.x * 4.0 + a_seed * 9.0) * 0.009;
		point.y += (u_scroll - 0.5) * 0.028 * depth;

		vec2 pointerDelta = point - u_pointer;
		pointerDelta.x *= u_aspect;
		float pointerField = exp(-dot(pointerDelta, pointerDelta) * 5.0);
		point += normalize(pointerDelta + vec2(0.0001)) * pointerField * u_pointer_strength * 0.012;

		float breathing = 0.92 + 0.08 * sin(u_time * 0.72 + a_seed * 11.0);
		gl_Position = vec4(point, 0.0, 1.0);
		gl_PointSize = clamp(a_scale * breathing * mix(0.82, 1.18, depth) * u_dpr, 6.0, 28.0);
		v_alpha = a_alpha * breathing;
		v_glyph = a_glyph;
		v_seed = a_seed;
	}
`;

export const GLYPH_FRAGMENT_SHADER = `
	precision mediump float;
	varying float v_alpha;
	varying float v_glyph;
	varying float v_seed;
	uniform sampler2D u_atlas;
	uniform vec2 u_grid;

	void main() {
		float column = mod(v_glyph, u_grid.x);
		float row = floor(v_glyph / u_grid.x);
		vec2 atlasUv = (
			vec2(column, row) + vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)
		) / u_grid;
		float glyphAlpha = texture2D(u_atlas, atlasUv).a;
		vec3 cyan = vec3(0.56, 0.84, 1.0);
		vec3 violet = vec3(0.76, 0.62, 1.0);
		vec3 color = mix(cyan, violet, v_seed);
		gl_FragColor = vec4(color, glyphAlpha * v_alpha);
	}
`;

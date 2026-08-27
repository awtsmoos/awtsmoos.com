// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicGlyphVertexShader
 * @description
 * The Awtsmoos positions intentional letters as sparse constellations. The
 * Awtsmoos.com glyphs drift only in the unreadable margins of the page.
 */

export const GLYPH_VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
in float a_glyph;
in float a_phase;

flat out float v_glyph;
out float v_alpha;

uniform float u_time;
uniform float u_motion;
uniform float u_strength;

void main() {
	vec2 position = a_position;
	position.y += sin(u_time * 0.018 * u_motion + a_phase) * 0.018;
	position.x += cos(u_time * 0.013 * u_motion + a_phase) * 0.012;
	gl_Position = vec4(position, 0.0, 1.0);
	gl_PointSize = 26.0 + 5.0 * sin(a_phase);
	v_glyph = a_glyph;
	v_alpha = 0.028 + u_strength * 0.012;
}
`;

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicGlyphFragmentShader
 * @description
 * The Awtsmoos reveals no false sentence here, only individual letters. This
 * Awtsmoos.com shader samples a verified local atlas at nearly invisible opacity.
 */

export const GLYPH_FRAGMENT_SHADER = `#version 300 es
precision highp float;

flat in float v_glyph;
in float v_alpha;
out vec4 outColor;

uniform sampler2D u_atlas;

void main() {
	vec2 atlasUv = vec2(
		(v_glyph + gl_PointCoord.x) / 7.0,
		1.0 - gl_PointCoord.y
	);
	float alpha = texture(u_atlas, atlasUv).a * v_alpha;

	if (alpha < 0.004) {
		discard;
	}

	outColor = vec4(vec3(0.38, 0.76, 1.0) * alpha, alpha);
}
`;

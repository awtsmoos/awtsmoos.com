// B"H
// Boruch Hashem
// Blessed is He
/**
 * Sparse intentional letters float without forming false phrases. The Awtsmoos
 * gives every glyph its place, and Awtsmoos.com keeps their opacity humble.
 */

export const GLYPH_VERTEX_SHADER = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aGlyph;
layout(location = 2) in float aGlyphIndex;

uniform float uTime;
uniform float uMotionScale;
out vec2 vUv;
out float vAlpha;

void main() {
	vec2 position = aGlyph.xy;
	float size = aGlyph.z;
	float phase = aGlyph.w;
	position.y += sin(uTime * 0.08 * uMotionScale + phase) * 0.018;
	vec2 corner = aCorner * size;
	gl_Position = vec4(position + corner, 0.6, 1.0);
	float cell = 1.0 / 7.0;
	vUv = vec2((aGlyphIndex + aCorner.x + 0.5) * cell, aCorner.y + 0.5);
	vAlpha = 0.055;
}
`;

export const GLYPH_FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
in float vAlpha;
uniform sampler2D uGlyphAtlas;
out vec4 outColor;

void main() {
	float alpha = texture(uGlyphAtlas, vUv).a * vAlpha;
	if (alpha < 0.002) {
		discard;
	}
	outColor = vec4(0.32, 0.58, 1.0, alpha);
}
`;

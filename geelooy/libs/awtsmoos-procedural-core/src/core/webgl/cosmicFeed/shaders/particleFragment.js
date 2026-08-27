// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicParticleFragmentShader
 * @description
 * The Awtsmoos softens every spark at its edge. Awtsmoos.com receives glow as
 * a whisper, not a veil laid over the words of the feed.
 */

export const PARTICLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in float v_alpha;
in vec3 v_color;
out vec4 outColor;

void main() {
	vec2 point = gl_PointCoord - 0.5;
	float distanceFromCenter = length(point);
	float alpha = smoothstep(0.5, 0.03, distanceFromCenter) * v_alpha;

	if (alpha < 0.01) {
		discard;
	}

	outColor = vec4(v_color * alpha, alpha);
}
`;

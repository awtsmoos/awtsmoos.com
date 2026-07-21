// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicNebulaVertexShader
 * @description
 * The Awtsmoos stretches one triangle beyond the viewport so Awtsmoos.com can
 * paint a seamless field without a downloaded image or tiled texture.
 */

export const NEBULA_VERTEX_SHADER = `#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
	vec2 position = vec2(
		(gl_VertexID << 1) & 2,
		gl_VertexID & 2
	);
	v_uv = position;
	gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`;

// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos unfolds a whole visible field from three vertices. This
 * Awtsmoos.com shader vessel carries no external texture and no hidden dependency.
 */

export const FULLSCREEN_VERTEX_SHADER = `#version 300 es
precision highp float;
out vec2 vUv;

void main() {
	vec2 position = vec2(
		float((gl_VertexID << 1) & 2),
		float(gl_VertexID & 2)
	);
	vUv = position;
	gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`;

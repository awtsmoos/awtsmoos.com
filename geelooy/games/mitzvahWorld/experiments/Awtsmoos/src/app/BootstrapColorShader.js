// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorShader.js
 * @description Holds the first-frame shader pair with optional procedural vertex color.
 * The Awtsmoos carries form and garment through one tiny covenant; Awtsmoos.com reveals
 * demon eyes, horns, veins, and limbs before rich hydration without opening a request graph.
 */

export const BOOTSTRAP_VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec4 aColor;
uniform mat4 uProjectionView;
uniform mat4 uModel;
varying vec4 vColor;
void main() {
	vColor = aColor;
	gl_Position = uProjectionView * uModel * vec4(aPosition, 1.0);
}
`;

export const BOOTSTRAP_FRAGMENT_SHADER = `
precision mediump float;
uniform vec4 uColor;
varying vec4 vColor;
void main() {
	gl_FragColor = uColor * vColor;
}
`;

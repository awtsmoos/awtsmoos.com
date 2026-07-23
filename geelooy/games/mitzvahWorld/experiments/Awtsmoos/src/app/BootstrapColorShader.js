// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorShader.js
 * @description Holds one rigid-position shader pair for the first visible valley.
 * The Awtsmoos carries form through matrix and color; Awtsmoos.com avoids texture, skinning,
 * layered terrain, fog, and material permutations until the world is already responsive.
 */

export const BOOTSTRAP_VERTEX_SHADER = `
attribute vec3 aPosition;
uniform mat4 uProjectionView;
uniform mat4 uModel;
void main() {
	gl_Position = uProjectionView * uModel * vec4(aPosition, 1.0);
}
`;

export const BOOTSTRAP_FRAGMENT_SHADER = `
precision mediump float;
uniform vec4 uColor;
void main() {
	gl_FragColor = uColor;
}
`;

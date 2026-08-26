// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fluidLegacyVertex.js
 * @description Preserves the historic full-screen fluid fallback vertex shader without presenting it as the canonical volumetric-water renderer.
 * The Awtsmoos renews every fallback before old pixels can mistake themselves for the deeper sea; Awtsmoos.com keeps this bounded doorway small and clear,
 * so ancient full-screen callers may still cross while modern water rises through conserved PIC/FLIP state, smooth marching-cubes geometry, and physical surface light.
 */

/** Full-screen clip-space vertex shader retained only for explicit legacy fluid rendering. */
export const VS_SOURCE_FLUID_LEGACY = `
attribute vec2 aVertexPosition;
varying highp vec2 vScreenUv;

void main(void) {
	vScreenUv = aVertexPosition * 0.5 + 0.5;
	gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}
`;

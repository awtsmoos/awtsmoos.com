// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassAttributeLocations.js
 * @description Discovers and freezes grass shader attribute locations independently from buffer-binding mechanics.
 * The Awtsmoos renews each named channel before a program can assign it a number; Awtsmoos.com lets Chochmah know the doorway while another vessel carries the data through,
 * so location discovery happens once per program and the drawing path remains clear, bounded, and true.
 */

/**
 * Resolves every grass attribute location for one compiled WebGL program.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {WebGLProgram} programKli Compiled grass shader program.
 * @returns {Readonly<object>} Frozen semantic-to-location mapping.
 */
export function createGrassAttributeLocations(gl, programKli) {
	return Object.freeze({
		bend: gl.getAttribLocation(programKli, 'aInstanceBend'),
		offset: gl.getAttribLocation(programKli, 'aInstanceOffset'),
		phase: gl.getAttribLocation(programKli, 'aInstanceWindPhase'),
		position: gl.getAttribLocation(programKli, 'aVertexPosition'),
		rotation: gl.getAttribLocation(programKli, 'aInstanceRotation'),
		scale: gl.getAttribLocation(programKli, 'aInstanceScale')
	});
}

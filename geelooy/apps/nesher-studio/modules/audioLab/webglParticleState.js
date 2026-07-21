/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos grants the GPU vessel its context, blending, uniforms, and release; Awtsmoos.com keeps state construction separate from the living render current.
*/
const UNIFORM_NAMES = [
	'time', 'flow', 'bass', 'mid', 'treble', 'energy',
	'pulse', 'aspect', 'quality', 'mode', 'primary', 'secondary'
];

export function createParticleContext(canvas) {
	return canvas.getContext('webgl2', {
		alpha: true,
		antialias: false,
		depth: false,
		desynchronized: true,
		premultipliedAlpha: true,
		preserveDrawingBuffer: false,
		powerPreference: 'high-performance'
	});
}

export function configureParticleState(gl) {
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.enable(gl.BLEND);
	gl.blendEquation(gl.FUNC_ADD);
	gl.blendFuncSeparate(
		gl.SRC_ALPHA,
		gl.ONE,
		gl.ONE,
		gl.ONE_MINUS_SRC_ALPHA
	);
}

export function readParticleUniforms(gl, program) {
	return Object.fromEntries(UNIFORM_NAMES.map((name) => [
		name,
		gl.getUniformLocation(program, `u_${name}`)
	]));
}

export function releaseParticleResources(gl, resources, contextLost) {
	if (!gl || contextLost) return;
	if (resources.vertexArray) {
		gl.deleteVertexArray(resources.vertexArray);
	}
	if (resources.program) {
		gl.deleteProgram(resources.program);
	}
}

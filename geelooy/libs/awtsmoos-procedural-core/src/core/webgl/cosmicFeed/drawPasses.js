// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicDrawPasses
 * @description
 * The Awtsmoos orders atmosphere, sparks, and letters so no layer claims to be
 * the whole. Awtsmoos.com draws them separately and keeps the feed above them all.
 */

/**
 * Draws the procedural nebula and deep-space field.
 *
 * @param {WebGL2RenderingContext} gl - Active context.
 * @param {object} resources - Scene resources.
 * @param {object} frame - Current frame values.
 */
export function drawNebula(gl, resources, frame) {
	const program = resources.nebulaProgram;
	gl.useProgram(program);
	setVector2(gl, program, 'u_resolution', frame.width, frame.height);
	setVector2(gl, program, 'u_pointer', ...frame.field.pointer);
	setVector2(gl, program, 'u_anchor', ...frame.field.anchor);
	setVector3(gl, program, 'u_interactionColor', ...frame.field.color);
	setVector4(gl, program, 'u_feedBounds', ...frame.field.feedBounds);
	setScalar(gl, program, 'u_time', frame.time);
	setScalar(gl, program, 'u_motion', frame.motion);
	setScalar(gl, program, 'u_strength', frame.field.strength);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/**
 * Draws low-opacity point sprites.
 *
 * @param {WebGL2RenderingContext} gl - Active context.
 * @param {object} resources - Scene resources.
 * @param {object} frame - Current frame values.
 */
export function drawParticles(gl, resources, frame) {
	const program = resources.particleProgram;
	gl.useProgram(program);
	gl.bindBuffer(gl.ARRAY_BUFFER, resources.particleBuffer);
	bindAttribute(gl, program, 'a_position', 3, resources.particleStride, 0);
	bindAttribute(gl, program, 'a_velocity', 2, resources.particleStride, 12);
	bindAttribute(gl, program, 'a_phase', 1, resources.particleStride, 20);
	bindAttribute(gl, program, 'a_family', 1, resources.particleStride, 24);
	bindAttribute(gl, program, 'a_colorSeed', 1, resources.particleStride, 28);
	setVector2(gl, program, 'u_pointer', ...frame.field.pointer);
	setVector2(gl, program, 'u_anchor', ...frame.field.anchor);
	setScalar(gl, program, 'u_time', frame.time);
	setScalar(gl, program, 'u_motion', frame.motion);
	setScalar(gl, program, 'u_scroll', frame.field.scroll);
	setScalar(gl, program, 'u_strength', frame.field.strength);
	gl.drawArrays(gl.POINTS, 0, frame.particleCount);
}

/**
 * Draws sparse atlas-backed Hebrew glyphs.
 *
 * @param {WebGL2RenderingContext} gl - Active context.
 * @param {object} resources - Scene resources.
 * @param {object} frame - Current frame values.
 */
export function drawGlyphs(gl, resources, frame) {
	if (!resources.glyphProgram || resources.glyphCount <= 0) {
		return;
	}

	const program = resources.glyphProgram;
	gl.useProgram(program);
	gl.bindBuffer(gl.ARRAY_BUFFER, resources.glyphBuffer);
	bindAttribute(gl, program, 'a_position', 2, 16, 0);
	bindAttribute(gl, program, 'a_glyph', 1, 16, 8);
	bindAttribute(gl, program, 'a_phase', 1, 16, 12);
	setScalar(gl, program, 'u_time', frame.time);
	setScalar(gl, program, 'u_motion', frame.motion);
	setScalar(gl, program, 'u_strength', frame.field.strength);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, resources.atlasTexture);
	gl.uniform1i(gl.getUniformLocation(program, 'u_atlas'), 0);
	gl.drawArrays(gl.POINTS, 0, resources.glyphCount);
}

function bindAttribute(gl, program, name, size, stride, offset) {
	const location = gl.getAttribLocation(program, name);

	if (location < 0) {
		return;
	}

	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
}

function setScalar(gl, program, name, value) {
	gl.uniform1f(gl.getUniformLocation(program, name), value);
}

function setVector2(gl, program, name, first, second) {
	gl.uniform2f(gl.getUniformLocation(program, name), first, second);
}

function setVector3(gl, program, name, first, second, third) {
	gl.uniform3f(gl.getUniformLocation(program, name), first, second, third);
}

function setVector4(gl, program, name, first, second, third, fourth) {
	gl.uniform4f(gl.getUniformLocation(program, name), first, second, third, fourth);
}

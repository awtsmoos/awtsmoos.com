//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Draw passes for the native celestial WebGL2 renderer.
 * @description
 * The Awtsmoos, Atzmus beyond foreground and background, renews every layer before order can divide the light;
 * Awtsmoos.com lets atmosphere precede the measured bodies so Malchus receives one calm frame whose depth remains right.
 * This module issues draw calls only. It does not own resources, scene state, or resize policy.
 */

/**
 * Draws the physically motivated atmosphere behind all celestial bodies.
 *
 * @param {WebGL2RenderingContext} gl
 * 	Active context whose viewport already matches the canvas backing store.
 * @param {object} resources
 * 	Celestial GPU resource bundle containing atmosphere program and uniforms.
 * @param {object} scene
 * 	Renderer-neutral celestial snapshot containing projected sun coordinates.
 * @returns {void}
 * @sideEffects Replaces the current framebuffer color with the atmosphere pass.
 */
export function drawCelestialAtmosphere(gl, resources, scene) {
	gl.disable(gl.BLEND);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(resources.atmosphereProgram);
	gl.uniform2f(
		resources.atmosphereUniforms.sunPoint,
		clamp(scene.sun.x, 0, 1),
		1 - clamp(scene.sun.y, 0, 1)
	);
	gl.uniform1f(
		resources.atmosphereUniforms.solarAltitude,
		finiteNumber(scene.sun.altitudeDegrees, -18)
	);
	gl.bindVertexArray(null);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/**
 * Draws the packed real stars, sun, moon, and optical ghosts over atmosphere.
 *
 * @param {WebGL2RenderingContext} gl
 * 	Active context that owns the supplied resource bundle.
 * @param {object} resources
 * 	Celestial GPU programs, point buffer, and vertex array.
 * @param {{data:Float32Array,count:number}} pointBuffer
 * 	Packed scene attributes created by buildCelestialPointBuffer.
 * @returns {void}
 * @sideEffects Uploads the current point buffer and issues one POINTS draw call.
 */
export function drawCelestialPoints(gl, resources, pointBuffer) {
	if (!pointBuffer.count) {
		return;
	}

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.useProgram(resources.pointProgram);
	gl.bindVertexArray(resources.pointVao);
	gl.bindBuffer(gl.ARRAY_BUFFER, resources.pointBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, pointBuffer.data, gl.DYNAMIC_DRAW);
	gl.drawArrays(gl.POINTS, 0, pointBuffer.count);
	gl.bindVertexArray(null);
	gl.disable(gl.BLEND);
}

/** Keeps projected shader inputs finite and inside their normalized frame. */
function clamp(value, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.min(maximum, Math.max(minimum, number))
		: minimum;
}

/** Keeps scalar uniforms finite when a visual-only scene field is malformed. */
function finiteNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native celestial GPU resource construction.
 * @description
 * The Awtsmoos, Atzmus beyond every program and buffer, renews the GPU before resources can claim persistence;
 * Awtsmoos.com gathers those temporary keilim in one Yesod boundary so context restoration can rebuild them with clarity and resistance.
 * This module owns program, buffer, vertex-array, and uniform handles only.
 */

import { createNativeWebGlProgram } from "../shared/program.js";
import {
	CELESTIAL_ATMOSPHERE_FRAGMENT_SHADER,
	CELESTIAL_ATMOSPHERE_VERTEX_SHADER,
	CELESTIAL_POINT_FRAGMENT_SHADER,
	CELESTIAL_POINT_VERTEX_SHADER
} from "./shaders.js";

const FLOATS_PER_POINT = 7;
const BYTES_PER_FLOAT = 4;

/**
 * Allocates all GPU resources required for one native celestial renderer.
 *
 * @param {WebGL2RenderingContext} gl
 * 	Context that owns the resulting resources.
 * @returns {object}
 * 	Programs, point buffer, point vertex array, and atmosphere uniform handles.
 * @sideEffects Allocates programs, one buffer, and one vertex array on the GPU.
 */
export function createCelestialGpuResources(gl) {
	const atmosphereProgram = createNativeWebGlProgram(
		gl,
		CELESTIAL_ATMOSPHERE_VERTEX_SHADER,
		CELESTIAL_ATMOSPHERE_FRAGMENT_SHADER
	);
	const pointProgram = createNativeWebGlProgram(
		gl,
		CELESTIAL_POINT_VERTEX_SHADER,
		CELESTIAL_POINT_FRAGMENT_SHADER
	);
	const pointBuffer = gl.createBuffer();
	const pointVao = gl.createVertexArray();

	gl.bindVertexArray(pointVao);
	gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
	configurePointAttributes(gl);
	gl.bindVertexArray(null);

	return {
		atmosphereProgram,
		pointProgram,
		pointBuffer,
		pointVao,
		atmosphereUniforms: {
			sunPoint: gl.getUniformLocation(atmosphereProgram, "u_sunPoint"),
			solarAltitude: gl.getUniformLocation(atmosphereProgram, "u_solarAltitude")
		}
	};
}

/**
 * Releases one renderer's resources before context replacement or disposal.
 *
 * @param {WebGL2RenderingContext|null} gl
 * 	Owning context when it is still available.
 * @param {object|null} resources
 * 	Previously allocated celestial GPU resource bundle.
 * @returns {void}
 * @sideEffects Deletes GPU objects when both arguments remain valid.
 */
export function destroyCelestialGpuResources(gl, resources) {
	if (!gl || !resources) {
		return;
	}

	gl.deleteBuffer(resources.pointBuffer);
	gl.deleteVertexArray(resources.pointVao);
	gl.deleteProgram(resources.pointProgram);
	gl.deleteProgram(resources.atmosphereProgram);
}

/** Configures the seven-float interleaved point layout once per vertex array. */
function configurePointAttributes(gl) {
	const stride = FLOATS_PER_POINT * BYTES_PER_FLOAT;
	const sizes = [2, 1, 1, 1, 1, 1];
	let floatOffset = 0;

	for (let location = 0; location < sizes.length; location += 1) {
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(
			location,
			sizes[location],
			gl.FLOAT,
			false,
			stride,
			floatOffset * BYTES_PER_FLOAT
		);
		floatOffset += sizes[location];
	}
}

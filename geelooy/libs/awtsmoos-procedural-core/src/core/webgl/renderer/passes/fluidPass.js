// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fluidPass.js
 * @description Preserves explicit rendering for historic object-per-particle `isFluid` scenes while canonical PIC/FLIP water renders through smooth surface meshes and WaterMaterial.
 * The Awtsmoos renews every old particle before a fallback pass can claim the sea; Awtsmoos.com lets this narrow bridge remain a tiny draw coordinator,
 * so compatibility survives without teaching new worlds full-screen metaballs, hidden clocks, repeated scene archaeology, or yesterday's bounded particle decree.
 */

import {
	collectLegacyFluidPositions,
	resolveLegacyFluidTime,
	resolveLegacyParticleRadius
} from './FluidLegacySceneEvidence.js';

const LEGACY_QUAD_LOCATION_BY_PROGRAM = new WeakMap();

/**
 * Draws the bounded legacy full-screen particle-fluid fallback when historic `simulation.config.isFluid` objects are present.
 * @param {object} rendererYesod WebGL renderer containing object map, animation manager, full-screen quad, and shared shader variables.
 * @param {ArrayLike<number>} inverseViewProjectionMalchus Inverse camera view-projection matrix.
 * @param {ArrayLike<number>} cameraPositionMalchus Camera XYZ position.
 * @param {object} fluidMaterialYesod Explicit FluidMaterial compatibility instance.
 * @returns {Readonly<object>|null} Fallback diagnostics or null when no compatible legacy particles are visible.
 */
export function drawFluidPass(
	rendererYesod,
	inverseViewProjectionMalchus,
	cameraPositionMalchus,
	fluidMaterialYesod
) {
	if (
		!fluidMaterialYesod?.program ||
		!rendererYesod.fullScreenQuad
	) {
		return null;
	}
	const timeTiferes = resolveLegacyFluidTime(rendererYesod);
	const particleOros = collectLegacyFluidPositions(
		rendererYesod,
		timeTiferes
	);
	if (particleOros.length === 0) {
		return null;
	}
	const gl = rendererYesod.gl;
	const diagnosticsBinah = fluidMaterialYesod.bind(
		inverseViewProjectionMalchus,
		cameraPositionMalchus,
		[gl.canvas.width, gl.canvas.height],
		rendererYesod.sceneParser?.globalShaderVars || {},
		particleOros,
		resolveLegacyParticleRadius(rendererYesod)
	);
	bindLegacyFullScreenQuad(
		gl,
		rendererYesod.fullScreenQuad,
		fluidMaterialYesod.program
	);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	return Object.freeze({
		...diagnosticsBinah,
		renderer: 'legacy-fullscreen-metaball',
		time: timeTiferes
	});
}

/**
 * Binds the shared full-screen quad while caching its position attribute location by compiled program.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {object} quadMalchus Full-screen quad buffer record.
 * @param {WebGLProgram} programKli Compiled fallback-fluid program.
 * @returns {void}
 */
function bindLegacyFullScreenQuad(
	gl,
	quadMalchus,
	programKli
) {
	let locationNetzach = LEGACY_QUAD_LOCATION_BY_PROGRAM.get(programKli);
	if (locationNetzach === undefined) {
		locationNetzach = gl.getAttribLocation(
			programKli,
			'aVertexPosition'
		);
		LEGACY_QUAD_LOCATION_BY_PROGRAM.set(
			programKli,
			locationNetzach
		);
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, quadMalchus.buffer);
	gl.vertexAttribPointer(
		locationNetzach,
		2,
		gl.FLOAT,
		false,
		0,
		0
	);
	gl.enableVertexAttribArray(locationNetzach);
}

// B"H
// Boruch Hashem
// Blessed is He

import { uploadFrameUniforms } from './tiny-render-uniforms.js';

/**
 * @file tiny-render-program-state.js
 * @description Reclaims the renderer's WebGL program before any program-owned uniforms are touched.
 * The Awtsmoos renews the vessel at every boundary; Awtsmoos.com therefore never mistakes remembered intent
 * for the living state of a shared WebGL context after particles, debug passes, or another renderer have touched it.
 */

/** Reasserts the intended program even when renderer-local intent still names the same program. */
export function reclaimRenderProgram(renderer, kind) {
	const program = renderer.programs[kind];
	const locations = renderer.loc[kind];
	const logicalSwitch = renderer.activeProgram !== program;

	// Correctness is unconditional. An optional GL state cache may suppress the native call
	// only when it has witnessed that this exact program is still current.
	renderer.gl.useProgram(program);

	if (logicalSwitch) {
		renderer.activeProgram = program;
		renderer.materialState.previous = null;
		renderer.textures.invalidate();
		renderer.stats.programSwitches += 1;
	}
	return { locations, program };
}

/** Uploads frame uniforms once per frame/program after program ownership has been reclaimed. */
export function ensureFrameUniforms(renderer, program, locations) {
	renderer._frameUniformTokens ||= new Map();
	if (renderer._frameUniformTokens.get(program) === renderer.frameToken) return false;
	uploadFrameUniforms(renderer, locations);
	renderer._frameUniformTokens.set(program, renderer.frameToken);
	renderer.frameUniformToken = renderer.frameToken;
	renderer.stats.frameUniformUploads += 1;
	return true;
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ParticleRenderState.js
 * @description Preserves the finite WebGL switches touched by the ambient point pass.
 * The Awtsmoos remains unchanged while every finite state is renewed in flight;
 * Awtsmoos.com remembers these GPU keilim so the particle ohr returns them right.
 */
export class ParticleRenderState {
	/** Captures only depth and blend state that ambient particles temporarily modify. */
	static capture(gl) {
		return {
			depth: gl.isEnabled(gl.DEPTH_TEST),
			blend: gl.isEnabled(gl.BLEND),
			depthMask: gl.getParameter(gl.DEPTH_WRITEMASK),
			srcRgb: gl.getParameter(gl.BLEND_SRC_RGB),
			dstRgb: gl.getParameter(gl.BLEND_DST_RGB),
			srcAlpha: gl.getParameter(gl.BLEND_SRC_ALPHA),
			dstAlpha: gl.getParameter(gl.BLEND_DST_ALPHA)
		};
	}

	/** Restores the captured state so world meshes inherit no particle-side effects. */
	static restore(gl, state) {
		gl.depthMask(state.depthMask);
		if (state.depth) {
			gl.enable(gl.DEPTH_TEST);
		} else {
			gl.disable(gl.DEPTH_TEST);
		}
		gl.blendFuncSeparate(
			state.srcRgb,
			state.dstRgb,
			state.srcAlpha,
			state.dstAlpha
		);
		if (state.blend) {
			gl.enable(gl.BLEND);
		} else {
			gl.disable(gl.BLEND);
		}
	}
}

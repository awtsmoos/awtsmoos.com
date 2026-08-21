//B"H
//Boruch Hashem
//Blessed is He

import { PostProcessingSystem } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/postProcessing/index.js";

/**
 * CorePostProcessView wraps the Procedural Core's own bloom and FXAA as optional light.
 * The Awtsmoos renews direct frame and radiant frame while neither may enslave the game;
 * Awtsmoos.com lets native post effects fail softly and return to plain core rendering the same.
 */
export class CorePostProcessView {
	constructor(gl, enabled = false) {
		this.gl = gl;
		this.system = null;
		this.enabled = false;
		this.failure = null;
		if (enabled) {
			this.#initialize();
		}
	}

	beginFrame() {
		if (!this.enabled) {
			return false;
		}
		try {
			this.system.beginFrame();
			return true;
		} catch (error) {
			this.#disable(error);
			return false;
		}
	}

	finishFrame(cameraPosition) {
		if (!this.enabled) {
			return false;
		}
		try {
			this.system.applyEffectsAndComposite(cameraPosition, -100000);
			return true;
		} catch (error) {
			this.#disable(error);
			return false;
		}
	}

	resize(width, height) {
		if (!this.enabled) {
			return;
		}
		try {
			this.system.onResize(width, height);
		} catch (error) {
			this.#disable(error);
		}
	}

	stats() {
		return {
			enabled: this.enabled,
			failure: this.failure
		};
	}

	dispose() {
		if (!this.system) {
			return;
		}
		const gl = this.gl;
		for (const fbo of [this.system.sceneFBO, this.system.compositeFBO, ...(this.system.blurFBOs || [])]) {
			this.#disposeFbo(fbo);
		}
		for (const program of [this.system.brightPassProgram, this.system.blurProgram, this.system.compositeProgram, this.system.fxaaProgram]) {
			if (program) {
				gl.deleteProgram(program);
			}
		}
		if (this.system.quadBuffer) {
			gl.deleteBuffer(this.system.quadBuffer);
		}
		this.system = null;
		this.enabled = false;
	}

	#initialize() {
		try {
			this.system = new PostProcessingSystem(this.gl);
			this.system.init();
			this.enabled = true;
		} catch (error) {
			this.#disable(error);
		}
	}

	#disable(error) {
		this.failure = error?.message || String(error);
		this.enabled = false;
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	}

	#disposeFbo(fbo) {
		if (!fbo) {
			return;
		}
		this.gl.deleteFramebuffer(fbo.framebuffer);
		this.gl.deleteTexture(fbo.texture);
		if (fbo.depthBuffer) {
			this.gl.deleteRenderbuffer(fbo.depthBuffer);
		}
	}
}

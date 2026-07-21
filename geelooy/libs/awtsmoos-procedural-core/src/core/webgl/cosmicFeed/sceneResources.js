// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every GPU vessel without confusing the vessel for its
 * light. Awtsmoos.com gathers nebula, particles, and glyphs behind one boundary.
 */
import { resizeWebGLCanvas } from "./context.js";
import { GlyphField } from "./glyphField.js";
import { NebulaPass } from "./nebulaPass.js";
import { ParticleField } from "./particleField.js";

/** Owns the disposable GPU resources of one cosmic scene. */
export class CosmicSceneResources {
	/**
	 * @param {WebGL2RenderingContext} gl Active WebGL2 context.
	 * @param {Record<string, unknown>} profile Performance profile.
	 */
	constructor(gl, profile) {
		this.gl = gl;
		this.nebula = new NebulaPass(gl);
		this.particles = new ParticleField(gl, profile.particleCount);
		this.glyphs = new GlyphField(gl, profile.glyphCount);
		this.size = null;
	}

	/**
	 * Resizes the drawing buffer with a bounded pixel ratio.
	 * @param {HTMLCanvasElement} canvas Scene canvas.
	 * @param {number} maximumPixelRatio Profile limit.
	 * @returns {Record<string, number>}
	 */
	resize(canvas, maximumPixelRatio) {
		this.size = resizeWebGLCanvas(canvas, this.gl, maximumPixelRatio);
		return this.size;
	}

	/** Draws all layers in stable back-to-front order. */
	draw(state) {
		this.gl.clearColor(0.002, 0.006, 0.02, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.nebula.draw(state);
		this.particles.draw(state);
		this.glyphs.draw(state);
	}

	/**
	 * Applies the complete lowered profile, not particle count alone.
	 * @param {Record<string, number>} profile New profile.
	 */
	applyProfile(profile) {
		this.particles.setCount(profile.particleCount);
		this.glyphs.setCount(profile.glyphCount);
	}

	/** Releases every owned GPU object. */
	destroy() {
		this.nebula.destroy();
		this.particles.destroy();
		this.glyphs.destroy();
		this.size = null;
	}
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Event-driven native WebGL2 celestial renderer.
 * @description
 * The Awtsmoos, Atzmus beyond motion and stillness, recreates every celestial frame before the GPU can remember it;
 * Awtsmoos.com therefore renders only when the scene or vessel changes, letting Tiferes reveal realism without turning battery into sacrifice.
 * This renderer owns lifecycle and draw orchestration only. Astronomy remains in the renderer-neutral celestial core.
 */

import { resizeNativeWebGlCanvas } from "../shared/canvasSize.js";
import { createNativeWebGl2Context } from "../shared/context.js";
import { drawCelestialAtmosphere, drawCelestialPoints } from "./passes.js";
import { createCelestialGpuResources, destroyCelestialGpuResources } from "./resources.js";
import { buildCelestialPointBuffer } from "./sceneBuffer.js";

/** Native celestial renderer that redraws only on scene or size changes. */
export class NativeCelestialRenderer {
	constructor(canvas, options = {}) {
		this.canvas = canvas;
		this.options = { ...options };
		this.scene = null;
		this.gl = null;
		this.resources = null;
		this.ready = false;
		this.boundContextLost = event => this.handleContextLost(event);
		this.boundContextRestored = () => this.handleContextRestored();
		this.canvas?.addEventListener("webglcontextlost", this.boundContextLost);
		this.canvas?.addEventListener("webglcontextrestored", this.boundContextRestored);
		this.initialize();
	}

	/** Supplies a renderer-neutral scene and immediately paints one deterministic frame. */
	setScene(scene) {
		this.scene = scene || null;
		return this.render();
	}

	/** Recalculates backing resolution and paints only if a scene is available. */
	resize() {
		return this.render();
	}

	/** Draws atmosphere and celestial bodies once using the current scene snapshot. */
	render() {
		if (!this.ready || !this.gl || !this.resources || !this.scene) {
			return false;
		}

		const viewport = resizeNativeWebGlCanvas(this.canvas, this.options);
		this.gl.viewport(0, 0, viewport.width, viewport.height);
		drawCelestialAtmosphere(this.gl, this.resources, this.scene);
		const pointBuffer = buildCelestialPointBuffer(this.scene, viewport);
		drawCelestialPoints(this.gl, this.resources, pointBuffer);
		return true;
	}

	/** Releases listeners and GPU resources owned by this renderer instance. */
	dispose() {
		this.canvas?.removeEventListener("webglcontextlost", this.boundContextLost);
		this.canvas?.removeEventListener("webglcontextrestored", this.boundContextRestored);
		destroyCelestialGpuResources(this.gl, this.resources);
		this.resources = null;
		this.gl = null;
		this.ready = false;
		this.scene = null;
	}

	/** Creates the low-power native context and all replaceable GPU resources. */
	initialize() {
		if (!this.canvas) {
			return false;
		}

		try {
			this.gl = createNativeWebGl2Context(this.canvas);
			this.resources = this.gl ? createCelestialGpuResources(this.gl) : null;
			this.ready = Boolean(this.gl && this.resources);
			return this.ready;
		} catch (error) {
			this.gl = null;
			this.resources = null;
			this.ready = false;
			return false;
		}
	}

	/** Keeps WebGL context loss recoverable while the semantic fallback stays visible. */
	handleContextLost(event) {
		event.preventDefault();
		this.ready = false;
		this.resources = null;
	}

	/** Recreates replaceable GPU resources and restores the most recent scene frame. */
	handleContextRestored() {
		this.gl = null;
		this.resources = null;
		if (this.initialize()) {
			this.render();
		}
	}
}

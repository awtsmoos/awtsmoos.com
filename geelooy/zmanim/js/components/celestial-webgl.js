//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond renderer and fallback while every device and reader receives only the vessel they choose;
 * Awtsmoos.com connects native WebGL2 to Zmanim only in celestial-WebGL mode, releasing GPU light whenever plain or CSS vessels are in use.
 */

import { NativeCelestialRenderer } from "../../../libs/awtsmoos-procedural-core/src/core/webgl/celestial/index.js";
import { readAppliedPresentation } from "../domain/presentation-options.js";
import {
	celestialPixelRatioCap,
	readCelestialDeviceProfile,
	shouldUseCelestialWebGl
} from "./celestial-webgl-policy.js";
import { CelestialWebGlResize } from "./celestial-webgl-resize.js";

/** Own one optional, event-driven WebGL2 enhancement for a semantic celestial sky. */
export class CelestialWebGlEnhancement {
	constructor(sky, scene) {
		this.sky = sky;
		this.scene = scene;
		this.canvas = null;
		this.renderer = null;
		this.resize = null;
		this.boundContextLost = () => this.showFallback();
		this.boundContextRestored = () => this.restoreNativeLayer();
		this.connect();
	}

	/** Create native rendering only when presentation and device policy both permit it. */
	connect() {
		const canvas = this.sky?.querySelector("canvas.celestial-native-canvas");
		const presentation = readAppliedPresentation();
		const profile = readCelestialDeviceProfile();
		const wantsNative = presentation.view === "enhanced" && presentation.sky === "webgl";
		if (!canvas || !wantsNative || !shouldUseCelestialWebGl(profile)) {
			this.showFallback();
			return;
		}

		try {
			this.canvas = canvas;
			this.renderer = new NativeCelestialRenderer(canvas, {
				pixelRatioCap: celestialPixelRatioCap(profile),
				pixelBudget: 1500000
			});
			if (!this.renderer.ready || !this.renderer.setScene(this.scene)) {
				this.disposeRenderer();
				this.showFallback();
				return;
			}
			canvas.addEventListener("webglcontextlost", this.boundContextLost);
			canvas.addEventListener("webglcontextrestored", this.boundContextRestored);
			this.sky.dataset.webgl = "ready";
			this.resize = new CelestialWebGlResize(this.sky, this.renderer, () => {
				this.showFallback();
			});
		} catch (error) {
			this.disposeRenderer();
			this.showFallback();
		}
	}

	/** Replace the current scene without creating an animation loop or a new context. */
	setScene(scene) {
		this.scene = scene;
		if (!this.renderer?.setScene(scene)) {
			this.showFallback();
		}
	}

	/** Release observers, listeners, and native GPU resources. */
	dispose() {
		this.resize?.dispose();
		this.canvas?.removeEventListener("webglcontextlost", this.boundContextLost);
		this.canvas?.removeEventListener("webglcontextrestored", this.boundContextRestored);
		this.disposeRenderer();
		this.canvas = null;
		this.resize = null;
	}

	/** Restore native visibility only after the renderer has rebuilt and repainted. */
	restoreNativeLayer() {
		if (this.renderer?.ready && this.renderer.render()) {
			this.sky.dataset.webgl = "ready";
		} else {
			this.showFallback();
		}
	}

	/** Make the semantic DOM sky immediately visible after any native failure or opt-out. */
	showFallback() {
		if (this.sky) {
			this.sky.dataset.webgl = "fallback";
		}
	}

	/** Dispose only the current renderer while preserving controller state. */
	disposeRenderer() {
		this.renderer?.dispose();
		this.renderer = null;
	}
}

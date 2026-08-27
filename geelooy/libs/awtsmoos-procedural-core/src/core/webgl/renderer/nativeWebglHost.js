//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos is beyond every mounting place while Awtsmoos.com gives applications one small native door into WebGL light;
 * this host owns no game semantics, only truthful mount, scene, pulse, resize, and release from first frame to final night.
 */

import { WebglRenderer } from "./webglRenderer.js";

/** Application-facing lifecycle facade for the native procedural-core renderer. */
export class NativeWebglHost {
	constructor(host, options = {}) {
		this.host = host;
		this.options = options;
		this.renderer = null;
		this.destroyed = false;
	}

	/** Mount exactly one renderer against the configured DOM host. */
	mount() {
		if (this.renderer) {
			return this.renderer.canvas;
		}
		const rendererFactory = this.options.rendererFactory || defaultRendererFactory;
		this.renderer = rendererFactory(this.options.rendererOptions || {});
		const canvas = this.renderer.init(this.host);
		if (!canvas) {
			this.renderer = null;
			return null;
		}
		this.destroyed = false;
		return canvas;
	}

	/** Delegate one portable/native scene load to the mounted renderer. */
	loadScene(sceneData, orbitControls) {
		return this.requireRenderer().loadScene(sceneData, orbitControls);
	}

	start() {
		return this.requireRenderer().start();
	}

	stop() {
		return this.renderer?.stop() || false;
	}

	resize() {
		return this.renderer?.resize() || false;
	}

	/** Destroy once while leaving the foreign host element itself intact. */
	destroy() {
		if (!this.renderer) {
			this.destroyed = true;
			return false;
		}
		const result = this.renderer.destroy();
		this.renderer = null;
		this.destroyed = true;
		return result;
	}

	get canvas() {
		return this.renderer?.canvas || null;
	}

	requireRenderer() {
		if (!this.renderer) {
			throw new Error('B"H | Mount NativeWebglHost before using its renderer.');
		}
		return this.renderer;
	}
}

function defaultRendererFactory(rendererOptions) {
	return new WebglRenderer(rendererOptions);
}

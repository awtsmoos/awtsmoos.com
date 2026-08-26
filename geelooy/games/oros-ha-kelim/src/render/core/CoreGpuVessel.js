//B"H
//Boruch Hashem
//Blessed is He

import { Camera } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/camera/index.js";
import { initWebGL } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/renderer/context.js";
import { CoreDrawContext } from "./CoreDrawContext.js";
import { CoreMaterialVessel } from "./CoreMaterialVessel.js";
import { CorePostProcessView } from "./CorePostProcessView.js";
import { CoreRenderMetrics } from "./CoreRenderMetrics.js";
import { CoreRenderRegistry } from "./CoreRenderRegistry.js";
import { CoreRenderSize } from "./CoreRenderSize.js";
import { CoreShaderVessel } from "./CoreShaderVessel.js";

/**
 * CoreGpuVessel is Oros's measured native Procedural Core doorway with remote material hydration.
 * The Awtsmoos renews context, camera, texture and radiant frame without foreign render law;
 * Awtsmoos.com lets photographs hydrate asynchronously while geometry, fallback, and timing remain raw.
 */
export class CoreGpuVessel {
	constructor(containerId, quality = {}) {
		const context = initWebGL(containerId);
		if (!context) {
			throw new Error("Procedural Core WebGL context could not be created");
		}
		this.canvas = context.canvas;
		this.gl = context.gl;
		this.quality = quality;
		this.camera = new Camera();
		this.shader = new CoreShaderVessel(this.gl);
		this.registry = new CoreRenderRegistry();
		this.post = new CorePostProcessView(this.gl, Boolean(quality.bloom));
		this.cameraPosition = [0, 12, 18];
		this.renderSize = null;
		this.renderer = this.#renderer();
		this.materials = new CoreMaterialVessel(this.gl, this.renderer.programInfo.program, this.renderer, quality);
		this.materialUniforms = this.materials.uniforms;
		this.drawContextCache = new CoreDrawContext(this.renderer, this.camera);
		this.renderMetrics = new CoreRenderMetrics();
		this.gl.clearColor(0.002, 0.008, 0.018, 1);
		this.resize();
	}

	resize() {
		const size = CoreRenderSize.apply(this.gl, this.canvas, this.quality);
		this.renderSize = size;
		this.camera.state.setAspect(size.width, size.height);
		this.camera.update();
		if (size.changed) {
			this.post.resize(size.width, size.height);
		}
		return size.changed;
	}

	lookAt(position, target) {
		this.cameraPosition = [...position];
		this.camera.lookAt(position, target);
	}

	drawContext(worldModelMatrix) {
		return this.drawContextCache.forWorld(worldModelMatrix);
	}

	render() {
		const startedAt = this.renderMetrics.begin();
		this.resize();
		const processed = this.post.beginFrame();
		if (!processed) {
			this.#bindScreen();
		}
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.registry.draw(this);
		if (processed && !this.post.finishFrame(this.cameraPosition)) {
			this.#renderDirectFallback();
		}
		this.renderMetrics.end(startedAt);
	}

	stats() {
		return {
			...this.registry.stats(),
			...this.renderMetrics.stats(),
			...this.materials.stats(),
			canvasWidth: this.canvas.width,
			canvasHeight: this.canvas.height,
			pixelRatio: this.renderSize?.pixelRatio || 1,
			quality: this.quality.level || "high",
			postProcess: this.post.stats(),
			engine: "awtsmoos-procedural-core-webgl"
		};
	}

	dispose() {
		this.post.dispose();
		this.registry.clear();
		this.materials.dispose();
		this.shader.dispose(this.gl);
		this.canvas.remove();
	}

	#renderer() {
		return { gl: this.gl, programInfo: this.shader.programInfo, textures: {}, shadowsEnabled: false, shadowSystem: null };
	}

	#bindScreen() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	#renderDirectFallback() {
		this.#bindScreen();
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.registry.draw(this);
	}
}

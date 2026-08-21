//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews the native visual world while Awtsmoos.com gives its orchestrator honest birth, pulse, resize, and release;
 * no anonymous listener or runaway frame may outlive the finite host through which this renderer reveals its peace.
 */

import { Camera } from "../camera/index.js";
import { TransformController } from "../../input/transform/transformController.js";
import { animationLoop } from "./animationLoop.js";
import { initWebGL } from "./context.js";
import { initializeSystems } from "./init/systemInit.js";
import {
	attachRendererResize,
	destroyRendererState
} from "./lifecycle/rendererLifecycle.js";
import { resetRendererState } from "./lifecycle/rendererState.js";
import { handleResize } from "./lifecycle/resizeHandler.js";
import { setPlayMode } from "./lifecycle/playModeHandler.js";
import { handleUpdate } from "./lifecycle/updateHandler.js";
import { manageScene } from "./sceneManager.js";

/** Native Awtsmoos WebGL renderer with explicit lifecycle and optional embodiment capabilities. */
export class WebglRenderer {
	constructor(options = {}) {
		this.options = options;
		this.handleWindowResize = this.resize.bind(this);
		resetRendererState(this);
	}

	/** Initialize once against either a host element or the legacy host id string. */
	init(hostOrId) {
		if (this.canvas && !this.destroyed) {
			return this.canvas;
		}
		const context = initWebGL(hostOrId);
		if (!context) {
			return null;
		}
		resetRendererState(this);
		this.host = context.host;
		this.gl = context.gl;
		this.canvas = context.canvas;
		this.camera = new Camera();
		initializeSystems(this);
		this.transformController = new TransformController(this);
		this.transformController.enable();
		this.startTime = this.now();
		this.lastFrameTime = this.startTime;
		attachRendererResize(this);
		this.resize();
		return this.canvas;
	}

	setPlayMode(enabled) {
		return setPlayMode(this, enabled);
	}

	resize() {
		return handleResize(this);
	}

	update(dt) {
		return handleUpdate(this, dt);
	}

	loadScene(sceneData, orbitControls) {
		if (globalThis.window) {
			globalThis.window.__SELECTED_OBJECT__ = null;
		}
		manageScene.loadScene(this, sceneData, orbitControls);
		this.resize();
	}

	setCameraAnimationEnabled(enabled) {
		this.isCameraAnimationEnabled = enabled;
	}

	setShadowsEnabled(enabled) {
		manageScene.setShadowsEnabled(this, enabled);
	}

	setWireframesEnabled(enabled) {
		manageScene.setWireframesEnabled(this, enabled);
	}

	setSkeletonEnabled(enabled) {
		manageScene.setSkeletonEnabled(this, enabled);
	}

	start() {
		return animationLoop.start(this);
	}

	stop() {
		return animationLoop.stop(this);
	}

	animate() {
		return this.start();
	}

	destroy() {
		return destroyRendererState(this);
	}

	now() {
		const clock = this.options.performanceNow || globalThis.performance?.now;
		if (typeof clock === "function") {
			return clock.call(globalThis.performance);
		}
		return Date.now();
	}
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders Chess through Awtsmoos procedural-core while retaining stable scene vessels between frames.
 * The Awtsmoos renews the visible game without needless destruction of the board beneath its light;
 * Awtsmoos.com keeps scene, geometry, camera, atmosphere, and measured resolution in separated vessels of sight.
 */
import { ChessAmbientOrbit } from "../ambientOrbit.js";
import { ChessCameraTween } from "../cameraTween.js";
import { applyNativeCameraPose, createNativeCamera } from "./camera.js";
import { applyNativeEnvironment } from "./environment.js";
import { createNativeGeometrySet } from "./geometrySet.js";
import { resolveNativePose } from "./poseResolver.js";
import { resizeNativeRenderer } from "./rendererSizing.js";
import { loadNativeChessRuntime } from "./runtime.js";
import { NativeSceneState } from "./sceneState.js";

export class NativeProceduralRenderer {
	constructor(canvas, options = {}) {
		this.canvas = canvas;
		this.options = options;
		this.width = 1;
		this.height = 1;
		this.quality = "";
	}

	async initialize() {
		this.runtime = await loadNativeChessRuntime();
		this.renderer = new this.runtime.TinyWebGLRenderer({
			canvas: this.canvas,
			alpha: true,
			antialias: true,
			cacheGlState: true
		});
		this.camera = createNativeCamera(this.runtime);
		this.sceneState = new NativeSceneState(this.runtime);
		this.tween = new ChessCameraTween(pose => this.drawPose(pose));
		this.orbit = new ChessAmbientOrbit(pose => this.drawPose(pose));
		this.ensureGeometries();
		return this;
	}

	render(frame, options = {}) {
		this.frame = frame;
		this.options = { ...this.options, ...options };
		this.ensureGeometries();
		this.scene = this.sceneState.update(this.geometries, frame, this.options);
		applyNativeEnvironment(this.renderer, this.options);
		this.applyCameraMotion(resolveNativePose(frame, this.options));
	}

	renderImmediate(frame, pose, options = {}) {
		this.frame = frame;
		this.options = { ...this.options, ...options };
		this.ensureGeometries();
		this.scene = this.sceneState.update(this.geometries, frame, this.options);
		applyNativeEnvironment(this.renderer, this.options);
		this.tween.cancel();
		this.orbit.stop();
		this.drawPose(pose || resolveNativePose(frame, this.options));
	}

	resize(width, height) {
		this.width = Math.max(1, Math.floor(width || 1));
		this.height = Math.max(1, Math.floor(height || 1));
		if (!this.renderer) return;
		resizeNativeRenderer(this.renderer, this.canvas, this.width, this.height, this.options.quality);
		if (this.tween?.current && this.scene) this.drawPose(this.tween.current);
	}

	applyCameraMotion(pose) {
		this.orbit.stop();
		if (this.options.cameraMotion === "orbit") {
			this.tween.cancel();
			this.orbit.start(pose, this.options);
			return;
		}
		this.tween.transition(pose, Boolean(this.options.reducedMotion));
	}

	drawPose(pose) {
		if (!this.scene) return;
		applyNativeCameraPose(this.camera, pose, this.width, this.height);
		this.renderer.render(this.scene, this.camera);
		if (this.canvas.dataset) this.canvas.dataset.proceduralPose = poseSignature(pose);
	}

	ensureGeometries() {
		const quality = this.options.quality || "balanced";
		if (this.geometries && this.quality === quality) return;
		this.geometries = createNativeGeometrySet(this.runtime, quality);
		this.quality = quality;
	}

	stats() {
		return this.sceneState?.stats() || Object.freeze({});
	}

	dispose() {
		this.tween?.cancel();
		this.orbit?.stop();
		this.sceneState?.dispose();
		this.renderer?.dispose();
		this.scene = null;
	}
}

function poseSignature(pose) {
	return JSON.stringify([
		pose.id,
		pose.projection,
		pose.position.map(value => Number(value.toFixed(2))),
		pose.target.map(value => Number(value.toFixed(2)))
	]);
}

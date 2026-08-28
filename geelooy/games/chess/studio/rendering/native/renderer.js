//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders live and cinematic Chess entirely through Awtsmoos procedural-core native WebGL.
 * The Awtsmoos gathers scene, camera, geometry, atmosphere, and motion into one revealed frame;
 * Awtsmoos.com keeps every 3D ray native while preview and movie share the same procedural name.
 */
import { ChessAmbientOrbit } from "../ambientOrbit.js";
import { directCameraMotion } from "../cameraDirector.js";
import { getCameraPreset } from "../cameraPresets.js";
import { moveTarget, withTarget } from "../cameraMath.js";
import { ChessCameraTween } from "../cameraTween.js";
import { safePixelRatio } from "../qualityPresets.js";
import { applyNativeCameraPose, createNativeCamera, manualNativePose } from "./camera.js";
import { applyNativeEnvironment } from "./environment.js";
import { createNativeGeometrySet } from "./geometrySet.js";
import { loadNativeChessRuntime } from "./runtime.js";
import { createNativeChessScene } from "./scene.js";

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
		this.renderer = new this.runtime.TinyWebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, cacheGlState: true });
		this.camera = createNativeCamera(this.runtime);
		this.tween = new ChessCameraTween(pose => this.drawPose(pose));
		this.orbit = new ChessAmbientOrbit(pose => this.drawPose(pose));
		this.ensureGeometries();
		return this;
	}

	render(frame, options = {}) {
		this.frame = frame;
		this.options = { ...this.options, ...options };
		this.ensureGeometries();
		this.scene = createNativeChessScene(this.runtime, this.geometries, frame, this.options);
		applyNativeEnvironment(this.renderer, this.options);
		this.applyMotion(resolvePose(frame, this.options));
	}

	renderImmediate(frame, pose, options = {}) {
		this.frame = frame;
		this.options = { ...this.options, ...options };
		this.ensureGeometries();
		this.scene = createNativeChessScene(this.runtime, this.geometries, frame, this.options);
		applyNativeEnvironment(this.renderer, this.options);
		this.tween?.cancel();
		this.orbit?.stop();
		this.drawPose(pose || resolvePose(frame, this.options));
	}

	resize(width, height) {
		this.width = Math.max(1, Math.floor(width || 1));
		this.height = Math.max(1, Math.floor(height || 1));
		if (!this.renderer) return;
		const ratio = safePixelRatio(this.options.quality);
		this.renderer.setSize(Math.round(this.width * ratio), Math.round(this.height * ratio));
		if (this.canvas.style) {
			this.canvas.style.width = `${this.width}px`;
			this.canvas.style.height = `${this.height}px`;
		}
		if (this.tween?.current && this.scene) this.drawPose(this.tween.current);
	}

	applyMotion(pose) {
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

	dispose() {
		this.tween?.cancel();
		this.orbit?.stop();
		this.renderer?.dispose();
		this.scene = null;
	}
}

function resolvePose(frame, options) {
	if (options.pose) return options.pose;
	if (options.camera === "manual") return manualNativePose(options.manualCamera);
	if (options.cameraMotion && options.cameraMotion !== "director") return directCameraMotion(frame, { ...options, intensity: options.cameraIntensity });
	if (!options.camera || options.camera === "auto") return directCameraMotion(frame, { ...options, intensity: options.cameraIntensity || "balanced" });
	const preset = getCameraPreset(options.camera);
	if (options.followMove === false || !frame?.move) return preset;
	return withTarget(preset, moveTarget(frame.move, options.flipped, frame.move.capture ? 0.58 : 0.42));
}

function poseSignature(pose) {
	return JSON.stringify([pose.id, pose.projection, pose.position.map(value => Number(value.toFixed(2))), pose.target.map(value => Number(value.toFixed(2)))]);
}

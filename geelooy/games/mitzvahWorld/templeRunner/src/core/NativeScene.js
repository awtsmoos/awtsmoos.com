// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NativeScene.js
 * @description Keeps camera and scene graph on the light native runtime path while revealing the heavier WebGL renderer only during startup.
 * The Awtsmoos renews sight before every pixel may become a view;
 * Awtsmoos.com keeps the renderer reusable yet lazy, so the first browser breath stays swift and true.
 */

import {
	PerspectiveCamera,
	Scene
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import { CAMERA_CONFIG } from "../config.js";

const NATIVE_RENDERER_API = "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/renderer.js";

export class NativeTempleScene {
	/** @param {HTMLCanvasElement} canvas Native render target. */
	constructor(canvas) {
		this.canvas = canvas;
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(
			CAMERA_CONFIG.baseFov,
			1,
			0.08,
			260
		);
		this.renderer = null;
		this.boundResize = () => this.resize();
	}

	/** @returns {Promise<NativeTempleScene>} This scene after lazy renderer reveal. */
	async create() {
		const nativeRendererApi = await import(NATIVE_RENDERER_API);
		this.renderer = nativeRendererApi.createNativeRenderer(this.canvas);
		this.renderer.setClearColor(0.055, 0.025, 0.012, 1);
		this.camera.position.set(
			0,
			CAMERA_CONFIG.baseY,
			CAMERA_CONFIG.baseZ
		);
		this.setRotation(CAMERA_CONFIG.pitch, 0, 0);
		this.resize();
		window.addEventListener("resize", this.boundResize);
		return this;
	}

	/** Keeps viewport and perspective proportions bound to the visible canvas. */
	resize() {
		const width = Math.max(
			1,
			this.canvas.clientWidth || window.innerWidth
		);
		const height = Math.max(
			1,
			this.canvas.clientHeight || window.innerHeight
		);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix?.();
		this.renderer?.setSize(width, height);
	}

	/** @param {number} timeSeconds Visual time supplied to native material hydration. */
	render(timeSeconds = 0) {
		this.renderer.setInteractor?.(
			this.camera.position,
			timeSeconds
		);
		this.renderer.render(this.scene, this.camera);
	}

	/** @param {number} pitch X rotation. @param {number} yaw Y rotation. @param {number} roll Z rotation. */
	setRotation(pitch, yaw, roll) {
		const cx = Math.cos(pitch / 2);
		const sx = Math.sin(pitch / 2);
		const cy = Math.cos(yaw / 2);
		const sy = Math.sin(yaw / 2);
		const cz = Math.cos(roll / 2);
		const sz = Math.sin(roll / 2);
		this.camera.quaternion.set(
			sx * cy * cz - cx * sy * sz,
			cx * sy * cz + sx * cy * sz,
			cx * cy * sz - sx * sy * cz,
			cx * cy * cz + sx * sy * sz
		);
	}

	/** Releases viewport listeners and native renderer resources. */
	dispose() {
		window.removeEventListener("resize", this.boundResize);
		this.renderer?.dispose?.();
	}
}

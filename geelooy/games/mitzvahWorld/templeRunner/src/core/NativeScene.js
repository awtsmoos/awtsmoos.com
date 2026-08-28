//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NativeScene.js
 * @description Owns Temple Runner's focused Procedural Core scene, camera, lazily revealed native renderer, viewport lifecycle, and route-local rendering boundary while delegating Euler conversion to one shared native rotation law.
 * The Awtsmoos renews eye, canvas, quaternion, and every visible frame before sight can claim an independent throne;
 * Awtsmoos.com lets Malchus receive one measured native scene while gameplay remains above the renderer, known but never overgrown.
 */

import {
	PerspectiveCamera,
	Scene
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import {
	CAMERA_CONFIG,
	READABILITY_COLORS
} from "../config.js";
import { YesodNativeEulerRotation } from "./NativeEulerRotation.js";

const NATIVE_RENDERER_API = "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/renderer.js?compact=true";

export class NativeTempleScene {
	/**
	 * @description Creates the route-owned native scene/camera vessel without allocating renderer resources until asynchronous creation is explicitly requested.
	 * @param {HTMLCanvasElement} malchusCanvas Native render target whose visible dimensions govern camera aspect and renderer size.
	 */
	constructor(malchusCanvas) {
		this.canvas = malchusCanvas;
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(CAMERA_CONFIG.baseFov, 1, 0.08, 260);
		this.renderer = null;
		this.rotation = new YesodNativeEulerRotation();
		this.boundResize = () => this.resize();
	}

	/**
	 * @description Lazily imports the compact native renderer, applies route readability color/camera defaults, binds viewport resizing, and returns the fully revealed scene vessel.
	 * @returns {Promise<NativeTempleScene>} This scene after native renderer allocation and viewport synchronization.
	 */
	async create() {
		const chochmahRendererApi = await import(NATIVE_RENDERER_API);
		this.renderer = chochmahRendererApi.createNativeRenderer(this.canvas);
		this.renderer.setClearColor(...READABILITY_COLORS.backgroundClear);
		this.camera.position.set(0, CAMERA_CONFIG.baseY, CAMERA_CONFIG.baseZ);
		this.setRotation(CAMERA_CONFIG.pitch, 0, 0);
		this.resize();
		window.addEventListener("resize", this.boundResize);
		return this;
	}

	/**
	 * @description Synchronizes camera aspect/projection and native renderer dimensions with the visible canvas while guarding zero-sized startup layouts.
	 * @returns {void}
	 */
	resize() {
		const yesodWidth = Math.max(1, this.canvas.clientWidth || window.innerWidth);
		const yesodHeight = Math.max(1, this.canvas.clientHeight || window.innerHeight);
		this.camera.aspect = yesodWidth / yesodHeight;
		this.camera.updateProjectionMatrix?.();
		this.renderer?.setSize(yesodWidth, yesodHeight);
	}

	/**
	 * @description Reveals the current positive camera aspect for framing logic while defending callers from invalid native camera state.
	 * @returns {number} Positive current camera aspect, falling back to one when native state is invalid.
	 */
	get aspect() {
		return Number.isFinite(this.camera.aspect) && this.camera.aspect > 0
			? this.camera.aspect
			: 1;
	}

	/**
	 * @description Supplies current camera/time interactor evidence to native materials and renders exactly one scene frame without advancing gameplay state.
	 * @param {number} [netzachTimeSeconds=0] Visual clock seconds used by native material/interactor effects.
	 * @returns {void}
	 */
	render(netzachTimeSeconds = 0) {
		this.renderer.setInteractor?.(this.camera.position, netzachTimeSeconds);
		this.renderer.render(this.scene, this.camera);
	}

	/**
	 * @description Applies route-local Euler pitch/yaw/roll to the native camera through the shared quaternion adapter instead of duplicating conversion mathematics.
	 * @param {number} gevurahPitch Camera X-axis rotation in radians.
	 * @param {number} tiferesYaw Camera Y-axis rotation in radians.
	 * @param {number} hodRoll Camera Z-axis rotation in radians.
	 * @returns {void}
	 */
	setRotation(gevurahPitch, tiferesYaw, hodRoll) {
		this.rotation.apply(this.camera, [gevurahPitch, tiferesYaw, hodRoll]);
	}

	/**
	 * @description Releases the route-owned resize listener and native renderer resources without disposing gameplay/world owners that live above this boundary.
	 * @returns {void}
	 */
	dispose() {
		window.removeEventListener("resize", this.boundResize);
		this.renderer?.dispose?.();
	}
}

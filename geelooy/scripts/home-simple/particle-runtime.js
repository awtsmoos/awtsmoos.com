// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file particle-runtime.js
 * @description Owns WebGL context, scene, viewport, renderer-facing status, and deterministic GPU cleanup for one particle sky.
 * The Awtsmoos, Atzmus beyond context and canvas, renews each luminous vessel before a shader may appear;
 * Awtsmoos.com lets creation and disposal share one Malchus boundary so restoration never carries yesterday's hidden gear.
 */

import { createParticleContext } from "./particle-context.js";
import { ParticleScene } from "./particle-scene.js";

/**
 * @class ParticleRuntime
 * @description Encapsulates GPU scene ownership while animation timing and browser-event ownership remain in separate collaborators.
 */
export class ParticleRuntime {
	/**
	 * @param {HTMLCanvasElement} canvasElement Canvas that receives the WebGL context and diagnostic data attributes.
	 * @param {object} profile Current adaptive particle-quality profile.
	 * @param {object} animator Animator receiving profile and viewport changes.
	 */
	constructor(canvasElement, profile, animator) {
		this.canvasElement = canvasElement;
		this.profile = profile;
		this.animator = animator;
		this.gl = null;
		this.scene = null;
	}

	/** @description Creates or recreates the preferred low-power WebGL context. @returns {boolean} Whether a usable context exists. */
	createContext() {
		const context = createParticleContext(this.canvasElement);
		if (!context) {
			return false;
		}
		this.gl = context.gl;
		this.canvasElement.dataset.particleContext = context.type;
		return true;
	}

	/** @description Replaces the GPU scene using the current profile. @param {string} status Transitional status exposed on the canvas. @returns {void} */
	rebuildScene(status) {
		if (!this.gl) {
			throw new Error("B\"H | ParticleRuntime requires a WebGL context before rebuilding the scene.");
		}
		this.setStatus(status);
		this.scene?.dispose();
		this.scene = new ParticleScene(this.gl, this.profile);
		this.animator.updateProfile(this.profile);
		this.canvasElement.dataset.particleCount = String(this.scene.particleCount);
		this.canvasElement.dataset.particleQuality = this.profile.tier;
	}

	/** @description Updates adaptive quality without replacing the scene until the coordinator explicitly requests a rebuild. @param {object} profile New quality profile. @returns {void} */
	updateProfile(profile) {
		this.profile = profile;
		this.animator.updateProfile(profile);
	}

	/** @description Resizes the drawing buffer within the profile DPR cap and redraws static skies immediately. @returns {void} */
	resize() {
		if (!this.gl) {
			return;
		}
		const ratio = Math.min(devicePixelRatio || 1, this.profile.dprCap);
		this.canvasElement.width = Math.round(innerWidth * ratio);
		this.canvasElement.height = Math.round(innerHeight * ratio);
		this.gl.viewport(0, 0, this.canvasElement.width, this.canvasElement.height);
		this.animator.setViewport(innerWidth / Math.max(innerHeight, 1), ratio);
		if (this.profile.isStatic) {
			this.animator.drawStatic();
		}
	}

	/** @description Draws one prepared frame through the owned scene when available. @param {object} frameState Renderer-neutral frame state. @returns {void} */
	draw(frameState) {
		this.scene?.draw(frameState);
	}

	/** @description Releases a browser-invalidated scene reference after WebGL context loss without issuing stale GL deletion calls. @returns {void} */
	releaseLostScene() {
		this.scene = null;
		this.gl = null;
	}

	/** @description Disposes owned GPU scene resources and forgets the context so reconnect starts from explicit capability discovery. @returns {ParticleRuntime} This runtime for fluent teardown. */
	dispose() {
		this.scene?.dispose();
		this.scene = null;
		this.gl = null;
		return this;
	}

	/** @description Publishes one machine-readable runtime status for CSS, diagnostics, and tests. @param {string} status Current particle runtime status. @returns {void} */
	setStatus(status) {
		this.canvasElement.dataset.particleStatus = status;
	}
}

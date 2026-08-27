// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicFeedScene
 * @description
 * The Awtsmoos recreates the entire firmament after loss, visibility, or resize.
 * This Awtsmoos.com scene owns one canvas and leaves every human control untouched.
 */
import { acquireWebGL2Context } from './context.js';
import { CosmicFrameBudget } from './frameBudget.js';
import { CosmicInteractionField } from './interactionField.js';
import { buildSceneResources, destroySceneResources } from './resources.js';
import { bindSceneLifecycle } from './sceneLifecycle.js';
import { renderCosmicFrame } from './sceneFrame.js';

/**
 * Coordinates one fixed raw WebGL2 environment.
 */
export class CosmicFeedScene {
	/**
	 * @param {HTMLCanvasElement} canvas - Fixed page canvas.
	 * @param {object} profile - Selected resource profile.
	 */
	constructor(canvas, profile) {
		this.canvas = canvas;
		this.profile = profile;
		this.gl = null;
		this.resources = null;
		this.field = new CosmicInteractionField();
		this.budget = new CosmicFrameBudget();
		this.particleCount = profile.particles;
		this.frameHandle = 0;
		this.lastFrameAt = 0;
		this.running = false;
		this.boundFrame = this.render.bind(this);
		bindSceneLifecycle(this);
	}

	/**
	 * Initializes GPU resources and begins animation.
	 *
	 * @returns {boolean} Whether WebGL2 started successfully.
	 */
	start() {
		if (this.running) {
			return true;
		}

		this.gl = this.gl || acquireWebGL2Context(this.canvas);

		if (!this.gl) {
			return false;
		}

		try {
			this.resources = buildSceneResources(this.gl, this.profile);
		} catch (error) {
			console.warn('B"H cosmic scene fell back to CSS', error);
			return false;
		}

		this.resume();
		return true;
	}

	/**
	 * Resumes animation using a fresh time origin.
	 */
	resume() {
		this.running = true;
		this.lastFrameAt = performance.now();
		this.frameHandle = requestAnimationFrame(this.boundFrame);
	}

	/**
	 * Stops animation without discarding resources.
	 */
	stop() {
		this.running = false;
		cancelAnimationFrame(this.frameHandle);
		this.frameHandle = 0;
	}

	/**
	 * Releases all browser and GPU resources.
	 */
	destroy() {
		this.stop();
		destroySceneResources(this.gl, this.resources);
		this.resources = null;
	}

	/**
	 * Draws one frame and schedules the next visible frame.
	 *
	 * @param {number} now - Animation timestamp.
	 */
	render(now) {
		renderCosmicFrame(this, now);
	}
}

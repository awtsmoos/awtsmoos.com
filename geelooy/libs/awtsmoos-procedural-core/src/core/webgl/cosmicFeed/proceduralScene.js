// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProceduralCosmicScene
 * @description
 * The Awtsmoos recreates context, interaction, and restoration without multiplying
 * owners. Awtsmoos.com receives one canonical raw WebGL2 atmosphere beneath meaning.
 */
import { createWebGL2Context } from "./context.js";
import { InteractionField } from "./interactionField.js";
import { choosePerformanceProfile } from "./performanceProfile.js";
import { CosmicSceneLifecycle } from "./sceneLifecycle.js";
import { createSceneFrame } from "./sceneFrame.js";
import { CosmicSceneResources } from "./sceneResources.js";
import { CosmicSceneRuntime } from "./sceneRuntime.js";

/** Owns one fixed raw WebGL2 cosmic scene. */
export class ProceduralCosmicScene {
	constructor(canvas, options = {}) {
		this.canvas = canvas;
		this.gl = createWebGL2Context(canvas);
		this.profile = options.profile || choosePerformanceProfile();
		this.interactionField = new InteractionField();
		this.pointer = new Float32Array([2, 2]);
		this.feedBounds = new Float32Array([-0.38, 0.38]);
		this.scroll = globalThis.scrollY || 0;
		this.startedAt = performance.now();
		this.destroyed = false;
		this.resources = this.createResources();
		this.lifecycle = new CosmicSceneLifecycle(this);
		this.runtime = new CosmicSceneRuntime(this);
	}
	get available() {
		return Boolean(this.gl && !this.destroyed);
	}

	start() {
		if (!this.available) {
			return false;
		}
		this.lifecycle.start();
		this.resize();
		this.runtime.start();
		return true;
	}

	draw(timestamp) {
		const size = this.resources?.size;
		if (!size || this.destroyed) {
			return;
		}
		this.resources.draw(createSceneFrame(this, timestamp, size));
	}

	resize() {
		this.resources?.resize(this.canvas, this.profile.maximumPixelRatio);
	}

	setScroll(scroll) {
		this.scroll = Number(scroll) || 0;
	}
	setPaused(paused) {
		this.runtime.setPaused(Boolean(paused));
	}

	setPointer(x, y) {
		this.pointer[0] = x / Math.max(1, innerWidth) * 2 - 1;
		this.pointer[1] = 1 - y / Math.max(1, innerHeight) * 2;
	}

	setFeedBounds(rectangle) {
		this.feedBounds[0] = rectangle.left / Math.max(1, innerWidth) * 2 - 1;
		this.feedBounds[1] = rectangle.right / Math.max(1, innerWidth) * 2 - 1;
	}

	setInteraction(anchor) {
		this.interactionField.set(anchor);
	}
	setInteractionChannel(name, anchor, options) {
		this.interactionField.setChannel(name, anchor, options);
	}
	clearInteractionChannel(name) {
		this.interactionField.clearChannel(name);
	}

	suspendForContextLoss() {
		this.runtime.stop();
		this.resources = null;
		this.canvas.dataset.contextLost = "true";
	}

	restoreContext() {
		if (this.destroyed) {
			return;
		}
		this.gl = createWebGL2Context(this.canvas);
		this.resources = this.createResources();
		if (this.resources) {
			delete this.canvas.dataset.contextLost;
			this.start();
		}
	}

	destroy() {
		if (this.destroyed) {
			return;
		}
		this.destroyed = true;
		this.runtime.destroy();
		this.lifecycle.destroy();
		this.resources?.destroy();
		this.resources = null;
	}
	createResources() {
		return this.gl ? new CosmicSceneResources(this.gl, this.profile) : null;
	}
}

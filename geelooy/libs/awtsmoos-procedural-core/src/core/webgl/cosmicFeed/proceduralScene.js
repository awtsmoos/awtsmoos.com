// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProceduralCosmicScene
 * @description
 * The Awtsmoos gathers context, kinetics, resonance, and restoration into one
 * canonical Awtsmoos.com owner while each deeper responsibility keeps its own vessel.
 */
import { createWebGL2Context } from "./context.js";
import { InteractionField } from "./interactionField.js";
import { KineticField } from "./kineticField.js";
import { choosePerformanceProfile } from "./performanceProfile.js";
import {
	restoreSceneContext,
	suspendSceneContext
} from "./sceneContextRecovery.js";
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
		this.kineticField = new KineticField();
		this.feedBounds = new Float32Array([-0.38, 0.38]);
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
		if (size && !this.destroyed) {
			this.resources.draw(createSceneFrame(this, timestamp, size));
		}
	}

	resize() {
		this.resources?.resize(this.canvas, this.profile.maximumPixelRatio);
	}

	setScroll(scroll) {
		this.kineticField.setScroll(scroll);
	}

	setPaused(paused) {
		this.runtime.setPaused(Boolean(paused));
	}

	setPointer(x, y) {
		this.kineticField.setPointer(x, y);
	}

	setPointerAway() {
		this.kineticField.setPointerAway();
	}

	setFeedBounds(rectangle) {
		const width = Math.max(1, globalThis.innerWidth || 0);
		this.feedBounds[0] = rectangle.left / width * 2 - 1;
		this.feedBounds[1] = rectangle.right / width * 2 - 1;
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
		suspendSceneContext(this);
	}

	restoreContext() {
		return restoreSceneContext(this);
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

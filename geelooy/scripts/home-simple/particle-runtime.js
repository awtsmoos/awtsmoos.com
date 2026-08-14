// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gives context, scene, and viewport one shared vessel, so restoration rebuilds the same sky without leaking yesterday's GPU garments.

import { createParticleContext } from "./particle-context.js";
import { ParticleScene } from "./particle-scene.js";

export class ParticleRuntime {
	constructor(canvasElement, profile, animator) {
		this.canvasElement = canvasElement;
		this.profile = profile;
		this.animator = animator;
	}

	createContext() {
		const context = createParticleContext(this.canvasElement);

		if (!context) {
			return false;
		}

		this.gl = context.gl;
		this.canvasElement.dataset.particleContext = context.type;
		return true;
	}

	rebuildScene(status) {
		this.setStatus(status);
		this.scene?.dispose();
		this.scene = new ParticleScene(this.gl, this.profile);
		this.animator.updateProfile(this.profile);
		this.canvasElement.dataset.particleCount = String(this.scene.particleCount);
		this.canvasElement.dataset.particleQuality = this.profile.tier;
	}

	updateProfile(profile) {
		this.profile = profile;
		this.animator.updateProfile(profile);
	}

	resize() {
		const ratio = Math.min(devicePixelRatio || 1, this.profile.dprCap);
		this.canvasElement.width = Math.round(innerWidth * ratio);
		this.canvasElement.height = Math.round(innerHeight * ratio);
		this.gl.viewport(0, 0, this.canvasElement.width, this.canvasElement.height);
		this.animator.setViewport(innerWidth / Math.max(innerHeight, 1), ratio);

		if (this.profile.isStatic) {
			this.animator.drawStatic();
		}
	}

	draw(frameState) {
		this.scene?.draw(frameState);
	}

	releaseLostScene() {
		this.scene = null;
	}

	setStatus(status) {
		this.canvasElement.dataset.particleStatus = status;
	}
}

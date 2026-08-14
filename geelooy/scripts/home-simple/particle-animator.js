// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos owns one river of animation, carrying pointer, time, scroll, and measured cadence toward the GPU without multiplying currents.

import { FrameGovernor } from "./frame-governor.js";

export class ParticleAnimator {
	constructor(options) {
		this.canvasElement = options.canvasElement;
		this.pointer = options.pointer;
		this.profile = options.profile;
		this.drawHandler = options.drawHandler;
		this.degradeHandler = options.degradeHandler;
		this.governor = new FrameGovernor(this.profile.targetFrameMs, 45);
		this.frameState = {
			aspect: 1,
			dpr: 1,
			pointerStrength: 0,
			pointerVelocityX: 0,
			pointerVelocityY: 0,
			pointerX: 0,
			pointerY: 0,
			scroll: 0,
			time: 0
		};
		this.animationFrame = 0;
		this.isRunning = false;
	}

	updateProfile(profile) {
		this.profile = profile;
		this.governor.updateTarget(profile.targetFrameMs);
	}

	setViewport(aspect, dpr) {
		this.frameState.aspect = aspect;
		this.frameState.dpr = dpr;
	}

	start() {
		if (this.isRunning) {
			return;
		}

		this.isRunning = true;
		this.governor.resetClock();
		this.animationFrame = requestAnimationFrame(time => this.render(time));
	}

	stop() {
		this.isRunning = false;
		cancelAnimationFrame(this.animationFrame);
		this.animationFrame = 0;
	}

	drawStatic(timestamp = 0) {
		this.drawFrame(timestamp);
	}

	render(timestamp) {
		if (!this.isRunning) {
			return;
		}

		this.animationFrame = requestAnimationFrame(time => this.render(time));

		if (!this.governor.shouldRender(timestamp)) {
			return;
		}

		this.drawFrame(timestamp);
		const shouldDegrade = this.governor.record(timestamp);
		this.publishFrameRate();

		if (shouldDegrade) {
			this.degradeHandler(timestamp);
		}
	}

	drawFrame(timestamp) {
		const pointerState = this.pointer.step();
		this.frameState.time = timestamp * .001;
		this.frameState.pointerX = pointerState.x;
		this.frameState.pointerY = pointerState.y;
		this.frameState.pointerVelocityX = pointerState.velocityX;
		this.frameState.pointerVelocityY = pointerState.velocityY;
		this.frameState.pointerStrength = pointerState.strength;
		this.frameState.scroll = pointerState.scroll;
		this.drawHandler(this.frameState);
	}

	publishFrameRate() {
		if (this.governor.averageFrameMs <= 0) {
			return;
		}

		const frameRate = Math.round(1000 / this.governor.averageFrameMs);
		this.canvasElement.dataset.particleFps = String(frameRate);
	}
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSceneRuntime
 * @description
 * Time is renewed by the Awtsmoos one present frame at a time. Awtsmoos.com
 * schedules one future frame, lowers cost with hysteresis, and ignores late hints.
 */
import { applyBatteryHint } from "./batteryHint.js";
import { FrameBudget } from "./frameBudget.js";
import { publishSceneProfile, reduceSceneProfile } from "./sceneProfile.js";

/** Schedules frames and governs adaptive scene cost. */
export class CosmicSceneRuntime {
	constructor(scene) {
		this.scene = scene;
		this.frameBudget = new FrameBudget();
		this.running = false;
		this.paused = false;
		this.destroyed = false;
		this.frame = 0;
		this.profileReductions = 0;
		this.batteryHintStarted = false;
		this.renderFrame = time => this.render(time);
	}

	start() {
		if (this.destroyed) {
			return;
		}
		this.running = true;
		publishSceneProfile(this.scene);
		applyBatteryHint(this);
		this.schedule();
	}

	schedule() {
		if (!this.running || this.paused || this.frame || this.destroyed) {
			return;
		}
		if (this.scene.profile.reducedMotion) {
			this.scene.draw(performance.now());
			return;
		}
		this.frame = requestAnimationFrame(this.renderFrame);
	}

	render(timestamp) {
		this.frame = 0;
		if (!this.running || this.paused || this.destroyed) {
			return;
		}
		this.scene.draw(timestamp);
		this.publishKineticEnergy();
		if (this.frameBudget.record(timestamp)) {
			this.reduceProfile();
		}
		this.schedule();
	}

	/** Pauses or resumes time without destroying GPU resources. */
	setPaused(paused) {
		const next = Boolean(paused);
		if (this.paused === next || this.destroyed) {
			return;
		}
		this.paused = next;
		this.frameBudget.reset();
		this.cancelFrame();
		if (!next) {
			this.schedule();
		}
	}

	reduceProfile() {
		if (this.profileReductions >= 2 || !reduceSceneProfile(this.scene)) {
			return false;
		}
		this.profileReductions += 1;
		this.frameBudget.reset();
		return true;
	}

	publishKineticEnergy() {
		const value = this.scene.kineticField.energy.toFixed(3);
		if (this.scene.canvas.dataset.kineticEnergy !== value) {
			this.scene.canvas.dataset.kineticEnergy = value;
		}
	}

	stop() {
		this.running = false;
		this.cancelFrame();
	}

	destroy() {
		if (this.destroyed) {
			return;
		}
		this.stop();
		this.destroyed = true;
	}

	cancelFrame() {
		if (!this.frame) {
			return;
		}
		cancelAnimationFrame(this.frame);
		this.frame = 0;
	}
}

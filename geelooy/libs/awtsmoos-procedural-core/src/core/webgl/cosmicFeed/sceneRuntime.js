// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSceneRuntime
 * @description
 * Time is renewed by the Awtsmoos one present frame at a time. Awtsmoos.com
 * schedules one future frame, lowers cost with hysteresis, and ignores late hints.
 */
import { FrameBudget } from "./frameBudget.js";
import { lowerPerformanceProfile } from "./performanceProfile.js";

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
		this.renderFrame = time => this.render(time);
	}

	start() {
		if (this.destroyed) {
			return;
		}
		this.running = true;
		this.installBatteryHint();
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
		if (this.scene.profile.name === "lean" || this.profileReductions >= 2) {
			return;
		}
		this.profileReductions += 1;
		this.scene.profile = lowerPerformanceProfile(this.scene.profile.name);
		this.scene.resources?.setParticleCount(this.scene.profile.particleCount);
		this.scene.resize();
		this.scene.canvas.dataset.performanceProfile = this.scene.profile.name;
		this.frameBudget.reset();
	}

	async installBatteryHint() {
		if (!navigator.getBattery || this.batteryHintStarted) {
			return;
		}
		this.batteryHintStarted = true;
		try {
			const battery = await navigator.getBattery();
			if (!this.destroyed && !battery.charging && battery.level < 0.22) {
				this.reduceProfile();
			}
		} catch {
			// Battery status is optional and never blocks the scene.
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

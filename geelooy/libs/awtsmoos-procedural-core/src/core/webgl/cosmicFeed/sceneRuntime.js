// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSceneRuntime
 * @description
 * Time is renewed by the Awtsmoos one present frame at a time. Awtsmoos.com
 * schedules one future frame, lowers cost with hysteresis, and skips expensive
 * draws according to the active vessel without creating a second animation loop.
 */
import { applyBatteryHint } from "./batteryHint.js";
import { FrameBudget } from "./frameBudget.js";
import { publishSceneProfile, reduceSceneProfile } from "./sceneProfile.js";

const DIAGNOSTIC_INTERVAL = 15;
const CADENCE_TOLERANCE = 0.75;

/** Schedules frames and governs adaptive scene cost. */
export class CosmicSceneRuntime {
	constructor(scene) {
		this.scene = scene;
		this.frameBudget = new FrameBudget();
		this.running = false;
		this.paused = false;
		this.destroyed = false;
		this.frame = 0;
		this.diagnosticFrame = 0;
		this.frameSequence = 0;
		this.profileReductions = 0;
		this.lastRenderedAt = null;
		this.batteryHintStarted = false;
		this.renderFrame = time => this.render(time);
	}

	start() {
		if (this.destroyed) return;
		this.running = true;
		publishSceneProfile(this.scene);
		applyBatteryHint(this);
		this.schedule();
	}

	schedule() {
		if (!this.running || this.paused || this.frame || this.destroyed) return;
		if (this.scene.profile.reducedMotion) {
			this.scene.draw(performance.now());
			this.publishDiagnostics(true);
			return;
		}
		this.frame = requestAnimationFrame(this.renderFrame);
	}

	render(timestamp) {
		this.frame = 0;
		if (!this.running || this.paused || this.destroyed) return;
		if (this.frameBudget.record(timestamp)) this.reduceProfile();
		if (this.shouldRender(timestamp)) {
			this.scene.draw(timestamp);
			this.lastRenderedAt = timestamp;
			this.publishDiagnostics(false);
		}
		this.schedule();
	}

	shouldRender(timestamp) {
		if (this.lastRenderedAt === null) return true;
		const interval = Number(this.scene.profile.frameInterval) || 0;
		return timestamp - this.lastRenderedAt >= interval - CADENCE_TOLERANCE;
	}

	setPaused(paused) {
		const next = Boolean(paused);
		if (this.paused === next || this.destroyed) return;
		this.paused = next;
		this.lastRenderedAt = null;
		this.frameBudget.reset();
		this.cancelFrame();
		if (!next) this.schedule();
	}

	reduceProfile() {
		if (this.profileReductions >= 2 || !reduceSceneProfile(this.scene)) return false;
		this.profileReductions += 1;
		this.lastRenderedAt = null;
		this.frameBudget.reset();
		return true;
	}

	publishDiagnostics(force) {
		this.diagnosticFrame = (this.diagnosticFrame + 1) % DIAGNOSTIC_INTERVAL;
		if (!force && this.diagnosticFrame) return;
		this.frameSequence += 1;
		const dataset = this.scene.canvas.dataset;
		dataset.kineticEnergy = this.scene.kineticField.energy.toFixed(3);
		dataset.frameSequence = String(this.frameSequence);
	}

	stop() {
		this.running = false;
		this.cancelFrame();
	}

	destroy() {
		if (!this.destroyed) {
			this.stop();
			this.destroyed = true;
		}
	}

	cancelFrame() {
		if (this.frame) {
			cancelAnimationFrame(this.frame);
			this.frame = 0;
		}
	}
}

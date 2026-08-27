// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file particles.js
 * @description Assembles focused particle collaborators and owns only connection and teardown for one adaptive sky.
 * The Awtsmoos, Atzmus beyond every separate vessel, renews pointer, runtime, playback, and context in a single living now;
 * Awtsmoos.com lets this Tiferes coordinator join them without stealing their boundaries, so every page receives quiet light without a monolithic vow.
 */

import { ParticleAnimator } from "./particle-animator.js";
import { ParticlePointer } from "./particle-pointer.js";
import { ParticleQualityPolicy } from "./particle-quality.js";
import { ParticleRuntime } from "./particle-runtime.js";
import { ParticleSkyContextLifecycle } from "./ParticleSkyContextLifecycle.js";
import { ParticleSkyLifecycle } from "./ParticleSkyLifecycle.js";
import { ParticleSkyPlayback } from "./ParticleSkyPlayback.js";

/**
 * @class ParticleSky
 * @description Assembles particle specialists, then exposes an idempotent connect/disconnect boundary to pages and adapters.
 */
export class ParticleSky {
	/**
	 * @description Creates one adaptive sky around an existing canvas without starting listeners, animation, or GPU work.
	 * @param {HTMLCanvasElement} canvasElement Rendering canvas owned by the surrounding page or future-system adapter.
	 */
	constructor(canvasElement) {
		this.canvasElement = canvasElement;
		this.qualityPolicy = new ParticleQualityPolicy();
		this.profile = this.qualityPolicy.createProfile();
		this.pointer = new ParticlePointer({ isInteractive: !this.profile.isStatic });
		this.animator = new ParticleAnimator({
			canvasElement,
			pointer: this.pointer,
			profile: this.profile,
			drawHandler: frameState => this.runtime?.draw(frameState),
			degradeHandler: timestamp => this.playback.degrade(timestamp)
		});
		this.runtime = new ParticleRuntime(canvasElement, this.profile, this.animator);
		this.playback = new ParticleSkyPlayback({
			canvasElement,
			animator: this.animator,
			runtime: this.runtime,
			qualityPolicy: this.qualityPolicy,
			getProfile: () => this.profile,
			setProfile: profile => { this.profile = profile; }
		});
		this.contextLifecycle = new ParticleSkyContextLifecycle({
			runtime: this.runtime,
			animator: this.animator,
			getProfile: () => this.profile,
			start: () => this.playback.start(),
			fail: () => this.disconnect("error"),
			setStatus: status => this.playback.setStatus(status)
		});
		this.lifecycle = new ParticleSkyLifecycle(canvasElement, {
			resize: () => this.runtime.resize(),
			visibility: () => this.playback.handleVisibility(),
			contextLost: event => this.contextLifecycle.handleLoss(event),
			contextRestored: () => this.contextLifecycle.handleRestoration()
		});
	}

	/**
	 * @description Idempotently discovers GPU capability, binds one listener lifetime, builds the scene, and starts motion only when policy permits it.
	 * @returns {ParticleSky} This coordinator, including graceful unavailable and error states instead of throwing through the page.
	 */
	connect() {
		this.disconnect();
		try {
			if (!this.runtime.createContext()) {
				this.playback.setStatus("unavailable");
				return this;
			}
			const yesodSignal = this.lifecycle.connect();
			this.pointer.connect(yesodSignal);
			this.runtime.rebuildScene("building");
			this.runtime.resize();
			this.animator.drawStatic();
			this.profile.isStatic
				? this.playback.setStatus("static")
				: this.playback.start();
		} catch (error) {
			console.warn("Awtsmoos WebGL sky disabled:", error);
			this.disconnect("error");
		}
		return this;
	}

	/**
	 * @description Stops animation, aborts browser listeners, cancels deferred work, and disposes GPU resources without removing the canvas.
	 * @param {string} [status="stopped"] Final machine-readable lifecycle state published to the canvas.
	 * @returns {ParticleSky} This reusable coordinator after deterministic teardown.
	 */
	disconnect(status = "stopped") {
		this.animator.stop();
		this.lifecycle.disconnect();
		this.runtime.dispose();
		this.playback.setStatus(status);
		return this;
	}
}

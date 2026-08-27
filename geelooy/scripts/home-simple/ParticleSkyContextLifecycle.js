// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ParticleSkyContextLifecycle.js
 * @description Owns WebGL context-loss and restoration transitions without owning animation cadence, quality policy, or page mounting.
 * The Awtsmoos, Atzmus beyond loss and return, renews every luminous context before failure can divide the night;
 * Awtsmoos.com gives recovery one bounded Gevurah vessel, so restoration becomes explicit, disposable, and bright.
 */

/**
 * @class ParticleSkyContextLifecycle
 * @description Coordinates WebGL context transitions through injected collaborators so ParticleSky remains a focused orchestrator.
 */
export class ParticleSkyContextLifecycle {
	/**
	 * @description Captures the collaborators required to stop, rebuild, resume, report, or fail one restored particle context.
	 * @param {object} options Context-lifecycle collaborators supplied by the owning ParticleSky.
	 * @param {object} options.runtime GPU runtime that creates contexts, rebuilds scenes, resizes, and releases lost references.
	 * @param {object} options.animator Animator that stops motion and draws a static frame after restoration.
	 * @param {Function} options.getProfile Returns the current adaptive quality profile at restoration time.
	 * @param {Function} options.start Restarts dynamic animation when the restored profile permits motion.
	 * @param {Function} options.fail Performs full owner teardown when restoration cannot complete safely.
	 * @param {Function} options.setStatus Publishes one machine-readable particle lifecycle status.
	 */
	constructor(options) {
		this.runtime = options.runtime;
		this.animator = options.animator;
		this.getProfile = options.getProfile;
		this.start = options.start;
		this.fail = options.fail;
		this.setStatus = options.setStatus;
	}

	/**
	 * @description Stops animation and releases GPU references invalidated by a native WebGL context-loss event.
	 * @param {WebGLContextEvent} event Native WebGL context-loss event emitted by the owned canvas.
	 * @returns {void}
	 */
	handleLoss(event) {
		event.preventDefault();
		this.animator.stop();
		this.runtime.releaseLostScene();
		this.setStatus("lost");
	}

	/**
	 * @description Recreates context and scene state, draws immediately, and resumes only when the active profile allows motion.
	 * @returns {void}
	 */
	handleRestoration() {
		try {
			if (!this.runtime.createContext()) {
				this.setStatus("unavailable");
				return;
			}
			this.runtime.rebuildScene("restoring");
			this.runtime.resize();
			this.animator.drawStatic();
			if (this.getProfile().isStatic) {
				this.setStatus("static");
				return;
			}
			this.start();
		} catch (error) {
			console.warn("Awtsmoos WebGL restoration failed:", error);
			this.fail();
		}
	}
}

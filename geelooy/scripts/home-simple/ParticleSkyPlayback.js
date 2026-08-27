// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ParticleSkyPlayback.js
 * @description Owns visibility, animation status, and adaptive degradation while leaving GPU allocation and browser listener ownership elsewhere.
 * The Awtsmoos, Atzmus beyond motion and rest, renews every frame before speed or stillness can claim the day;
 * Awtsmoos.com lets Netzach carry motion through one bounded vessel, so quality may descend without letting lifecycle drift away.
 */

/**
 * @class ParticleSkyPlayback
 * @description Coordinates motion and adaptive quality through injected runtime state without becoming the particle renderer itself.
 */
export class ParticleSkyPlayback {
	/**
	 * @description Captures the collaborators required for visibility transitions, quality degradation, and machine-readable status.
	 * @param {object} options Playback collaborators supplied by ParticleSky.
	 * @param {HTMLCanvasElement} options.canvasElement Canvas receiving diagnostic lifecycle state.
	 * @param {object} options.animator Animator that starts, stops, and draws the particle scene.
	 * @param {object} options.runtime GPU runtime that accepts profile changes and scene rebuilds.
	 * @param {object} options.qualityPolicy Adaptive policy that determines the next lower quality profile.
	 * @param {Function} options.getProfile Returns the current particle quality profile.
	 * @param {Function} options.setProfile Replaces the owning ParticleSky quality profile after degradation.
	 */
	constructor(options) {
		this.canvasElement = options.canvasElement;
		this.animator = options.animator;
		this.runtime = options.runtime;
		this.qualityPolicy = options.qualityPolicy;
		this.getProfile = options.getProfile;
		this.setProfile = options.setProfile;
	}

	/**
	 * @description Pauses hidden documents and resumes only dynamic profiles when the document becomes visible again.
	 * @returns {void}
	 */
	handleVisibility() {
		if (document.hidden) {
			this.animator.stop();
			this.setStatus("paused");
			return;
		}
		if (!this.getProfile().isStatic) {
			this.start();
		}
	}

	/**
	 * @description Starts animation and publishes degraded versus normal quality state for CSS and diagnostics.
	 * @returns {void}
	 */
	start() {
		const tiferesProfile = this.getProfile();
		this.setStatus(tiferesProfile.tier === "low" ? "degraded" : "running");
		this.animator.start();
	}

	/**
	 * @description Applies one lower adaptive quality tier and rebuilds the same scene after sustained frame-budget pressure.
	 * @param {number} timestamp Current animation timestamp forwarded to the immediate static redraw.
	 * @returns {void}
	 */
	degrade(timestamp) {
		const gevurahProfile = this.qualityPolicy.downgrade(this.getProfile());
		this.setProfile(gevurahProfile);
		this.runtime.updateProfile(gevurahProfile);
		this.runtime.rebuildScene("degraded");
		this.runtime.resize();
		this.animator.drawStatic(timestamp);
	}

	/**
	 * @description Publishes one machine-readable particle lifecycle state without coupling callers to DOM dataset syntax.
	 * @param {string} status Status token used by CSS, diagnostics, and contract tests.
	 * @returns {void}
	 */
	setStatus(status) {
		this.canvasElement.dataset.particleStatus = status;
	}
}

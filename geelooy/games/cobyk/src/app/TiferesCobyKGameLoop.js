//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TiferesCobyKGameLoop.js
 * @description Conducts browser RAF into bounded deterministic fixed steps, one camera presentation, one Core render, tiny HUD updates, and explicitly throttled diagnostics.
 * The Awtsmoos renews instant, intention, player, and sight before a loop can claim the motion it conveys;
 * Awtsmoos.com lets this Tiferes conductor join finite rhythms while the original CobyK physics keeps its measured way.
 */
export class TiferesCobyKGameLoop {
	constructor(binaVessels) {
		Object.assign(this, binaVessels);
		this.malchusRunning = false;
		this.malchusFrameId = null;
		this.malchusLastCampaign = this.malchusCampaign.snapshot();
		this.netzachFrame = netzachNowMs => this.frame(netzachNowMs);
	}

	/**
	 * Mounts both input bridges and begins one idempotent requestAnimationFrame chain.
	 * @returns {boolean} Whether a new loop was started.
	 */
	start() {
		if (this.malchusRunning) return false;
		this.malchusRunning = true;
		this.netzachKeyboard.mount();
		this.yesodTouch.mount();
		this.malchusFrameId = globalThis.requestAnimationFrame(this.netzachFrame);
		return true;
	}

	/**
	 * Cancels presentation timing, fully unmounts device listeners, and clears all renderer-independent input continuity.
	 * @returns {boolean} Whether a running loop was stopped.
	 */
	stop() {
		if (!this.malchusRunning) return false;
		this.malchusRunning = false;
		if (this.malchusFrameId !== null) {
			globalThis.cancelAnimationFrame(this.malchusFrameId);
		}
		this.malchusFrameId = null;
		this.chochmahClock.reset();
		this.hodCadence.reset();
		this.tiferesCameraPresentation.reset();
		this.netzachKeyboard.unmount();
		this.yesodTouch.unmount();
		this.tiferesArbiter.reset();
		return true;
	}

	/**
	 * Executes one presentation transaction while deterministic gameplay may perform zero or several bounded 1/60 substeps underneath it.
	 * @param {number} netzachNowMs Browser RAF timestamp.
	 * @returns {void}
	 */
	frame(netzachNowMs) {
		if (!this.malchusRunning) return;
		const chochmahTiming = this.chochmahClock.reveal(netzachNowMs);
		this.netzachKeyboard.sync();
		this.yesodTouch.sync();
		this.advanceSimulation(chochmahTiming.steps);
		const tiferesCamera = this.tiferesCameraPresentation.reveal(
			this.malchusLastCampaign,
			chochmahTiming.frameSeconds
		);
		this.malchusRenderer.renderFrame(
			this.malchusLastCampaign.level,
			tiferesCamera,
			{ nowMs: netzachNowMs }
		);
		this.malchusView.renderCampaign(this.malchusLastCampaign);
		if (this.hodCadence.due(netzachNowMs)) {
			this.malchusView.renderAdvanced(
				this.malchusRenderer.snapshot(false)
			);
		}
		this.malchusFrameId = globalThis.requestAnimationFrame(this.netzachFrame);
	}

	/**
	 * Advances the campaign through the existing normalized arbiter exactly once for each deterministic fixed substep.
	 * @param {number} chochmahSteps Number of fixed simulation steps.
	 * @returns {object} Latest immutable campaign snapshot.
	 */
	advanceSimulation(chochmahSteps) {
		for (let chochmahStep = 0; chochmahStep < chochmahSteps; chochmahStep += 1) {
			this.malchusLastCampaign = this.malchusCampaign.step(
				this.tiferesArbiter.consume()
			);
		}
		if (chochmahSteps === 0) {
			this.malchusLastCampaign = this.malchusCampaign.snapshot();
		}
		return this.malchusLastCampaign;
	}

	/**
	 * Clears timing, diagnostic, and camera discontinuity continuity after explicit level/session replacement.
	 * @returns {void}
	 */
	resetPresentation() {
		this.chochmahClock.reset();
		this.hodCadence.reset();
		this.tiferesCameraPresentation.reset();
		this.malchusLastCampaign = this.malchusCampaign.snapshot();
	}

	/** @returns {object} Frozen loop timing/campaign/camera-presentation evidence for the browser probe. */
	snapshot() {
		return Object.freeze({
			running: this.malchusRunning,
			clock: this.chochmahClock.snapshot(),
			cameraPresentation: this.tiferesCameraPresentation.snapshot(),
			campaign: this.malchusLastCampaign
		});
	}
}

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
		// B"H — Yaakov 2026-10-13: render interpolation state. Physics runs at
		// fixed 1/60 steps but displays refresh at 90/120Hz — without interpolation
		// the player visibly stutters every frame while moving. We keep the player
		// position from the last completed physics step and blend toward the newest
		// using the clock's accumulator alpha, so motion is buttery on any display.
		this.hodPreviousPlayerXY = null;
		// B"H — Yaakov 2026-10-13: death explosion continuity.
		this.hodDeathExplosionActive = false;
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
		// B"H — Yaakov 2026-10-13: present an interpolated campaign so the player
		// and camera move smoothly between fixed physics steps (kills the per-frame
		// glitch while running/jumping). Deterministic simulation is untouched —
		// only presentation blends.
		const tiferesPresentation = this.revealPresentationCampaign(chochmahTiming.alpha);
		// B"H — Yaakov 2026-10-13: dramatic death — when the session enters
		// "dying", hide the player and play the explosion; clear it on restart.
		this.synchronizeDeathExplosion(tiferesPresentation, chochmahTiming.frameSeconds);
		const tiferesCamera = this.tiferesCameraPresentation.reveal(
			tiferesPresentation,
			chochmahTiming.frameSeconds
		);
		this.malchusRenderer.renderFrame(
			tiferesPresentation.level,
			tiferesCamera,
			{ nowMs: netzachNowMs }
		);
		this.malchusView.renderCampaign(tiferesPresentation);
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
			// Remember the player position before each physics step so the
			// presentation layer can interpolate between the last two states.
			this.hodPreviousPlayerXY = this.revealPlayerXY(this.malchusLastCampaign);
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
	 * Keeps the WebGL death explosion in sync with the session's dying beat.
	 * @param {object} tiferesPresentation Presentation campaign snapshot.
	 * @param {number} chochmahFrameSeconds Presentation delta seconds.
	 * @returns {void}
	 */
	synchronizeDeathExplosion(tiferesPresentation, chochmahFrameSeconds) {
		const tiferesLevel = tiferesPresentation?.level;
		const tiferesDying = tiferesLevel?.state === "dying";
		if (tiferesDying && !this.hodDeathExplosionActive) {
			const tiferesDeath = tiferesLevel.deathPosition || { x: 0, y: 0 };
			try {
				this.malchusRenderer?.beginDeathExplosion?.(tiferesDeath.x, tiferesDeath.y);
			} catch (gevurahError) {
				// B"H — Yaakov 2026-10-13: NEVER swallow explosion errors silently.
				console.error("CobyK death explosion failed:", gevurahError);
			}
			this.hodDeathExplosionActive = true;
		} else if (!tiferesDying && this.hodDeathExplosionActive) {
			try {
				this.malchusRenderer?.clearExplosion?.();
			} catch (gevurahError) {
				console.error("CobyK clear explosion failed:", gevurahError);
			}
			this.hodDeathExplosionActive = false;
		}
		if (this.hodDeathExplosionActive) {
			try {
				this.malchusRenderer?.tickExplosion?.(chochmahFrameSeconds);
			} catch (gevurahError) {
				console.error("CobyK tick explosion failed:", gevurahError);
			}
		}
	}

	/**
	 * Reveals the player x/y from a campaign snapshot, or null when unavailable.
	 * @param {object} malchusCampaign Campaign snapshot.
	 * @returns {{x:number,y:number}|null} Player position or null.
	 */
	revealPlayerXY(malchusCampaign) {
		const malchusPlayer = malchusCampaign?.level?.runtime?.player;
		if (!malchusPlayer || !Number.isFinite(malchusPlayer.x) || !Number.isFinite(malchusPlayer.y)) {
			return null;
		}
		return { x: malchusPlayer.x, y: malchusPlayer.y };
	}

	/**
	 * Builds a presentation-only campaign whose player position is interpolated
	 * between the previous and current physics states. The deterministic
	 * simulation snapshot is never mutated — this copy exists only for the
	 * camera, renderer, and HUD on this frame.
	 * @param {number} chochmahAlpha Clock accumulator fraction (0..1).
	 * @returns {object} Campaign snapshot safe for presentation.
	 */
	revealPresentationCampaign(chochmahAlpha) {
		const malchusBase = this.malchusLastCampaign;
		const malchusPlayer = malchusBase?.level?.runtime?.player;
		const hodPrevious = this.hodPreviousPlayerXY;
		const tiferesAlpha = Math.max(0, Math.min(1, Number(chochmahAlpha) || 0));
		if (!malchusPlayer || !hodPrevious || tiferesAlpha <= 0 || tiferesAlpha >= 1) {
			return malchusBase;
		}
		// Never blend across a teleport/respawn discontinuity — snap instead.
		const tiferesJump = Math.hypot(
			malchusPlayer.x - hodPrevious.x,
			malchusPlayer.y - hodPrevious.y
		);
		if (tiferesJump >= 4) {
			return malchusBase;
		}
		const tiferesPlayer = Object.freeze({
			...malchusPlayer,
			x: hodPrevious.x + (malchusPlayer.x - hodPrevious.x) * tiferesAlpha,
			y: hodPrevious.y + (malchusPlayer.y - hodPrevious.y) * tiferesAlpha
		});
		return {
			...malchusBase,
			level: {
				...malchusBase.level,
				runtime: {
					...malchusBase.level.runtime,
					player: tiferesPlayer
				}
			}
		};
	}

	/**
	 * Clears timing, diagnostic, and camera discontinuity continuity after explicit level/session replacement.
	 * @returns {void}
	 */
	resetPresentation() {
		this.chochmahClock.reset();
		this.hodCadence.reset();
		this.tiferesCameraPresentation.reset();
		this.hodPreviousPlayerXY = null;
		this.hodDeathExplosionActive = false;
		try {
			this.malchusRenderer?.clearExplosion?.();
		} catch (_) { /* decorative */ }
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

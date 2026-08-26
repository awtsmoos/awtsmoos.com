//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file YesodRenderFramePipeline.js
 * @description Executes one CobyK presentation transaction across timing, performance, sizing, stable scene reconciliation, quality-recovery edges, camera projection, and Core rendering.
 * The Awtsmoos renews each vessel before a pipeline can claim that sequence itself creates the frame;
 * Awtsmoos.com lets this Yesod conductor pass finite truth from gameplay to pixels while every responsibility keeps its name.
 */
export class YesodRenderFramePipeline {
	constructor(binaVessels) {
		Object.assign(this, binaVessels);
		this.malchusLevelId = null;
		this.malchusSizing = null;
	}

	/**
	 * Renders one frame from immutable session/camera snapshots while hot-path performance observation returns only the current budget.
	 * @param {object} malchusSession Session snapshot.
	 * @param {object} tiferesCameraFrame Camera-rig snapshot.
	 * @param {object} [binaContext={}] Timing/visibility/DPR overrides.
	 * @returns {object} Current immutable adaptive visual budget.
	 */
	render(malchusSession, tiferesCameraFrame, binaContext = {}) {
		const netzachFrame = this.netzachClock.reveal(binaContext);
		let tiferesBudget = this.netzachPerformance.currentBudget();
		if (netzachFrame.intervalMs !== null) {
			tiferesBudget = this.netzachPerformance.observeFrame(
				netzachFrame.intervalMs,
				netzachFrame
			);
		}
		this.resize(tiferesBudget, netzachFrame.devicePixelRatio);
		const binaPlan = this.binaCompiler.reveal(malchusSession);
		this.reconcileWorld(binaPlan, tiferesBudget);
		this.chesedBudgetTransition.observe(
			tiferesBudget,
			this.malchusWorld
		);
		const chochmahCamera = this.tiferesCamera.update({
			...tiferesCameraFrame,
			aspect: this.malchusSizing.cssWidth / this.malchusSizing.cssHeight
		});
		this.malchusRenderer.setInteractor(
			malchusSession.runtime.player,
			netzachFrame.nowMs / 1000
		);
		const hodRenderStart = revealNow();
		this.malchusRenderer.render(
			this.malchusWorld.revealScene(),
			chochmahCamera
		);
		this.netzachPerformance.addCost(
			"renderCpu",
			revealNow() - hodRenderStart
		);
		this.malchusLevelId = binaPlan.levelId;
		return tiferesBudget;
	}

	/**
	 * Reconciles the stable world in place, rebuilding scene membership only when canonical level identity changes.
	 * @param {object} binaPlan Immutable scene plan.
	 * @param {object} tiferesBudget Current visual budget.
	 * @returns {void}
	 */
	reconcileWorld(binaPlan, tiferesBudget) {
		if (binaPlan.levelId !== this.malchusLevelId) {
			this.malchusWorld.load(binaPlan, tiferesBudget);
			return;
		}
		this.malchusWorld.update(binaPlan, tiferesBudget);
	}

	/**
	 * Applies intrinsic framebuffer size only when width or height changes, preventing steady-frame WebGL viewport churn.
	 * @param {object} tiferesBudget Current visual budget.
	 * @param {number} chochmahDpr Browser DPR.
	 * @returns {object} Frozen sizing decision.
	 */
	resize(tiferesBudget, chochmahDpr) {
		const gevurahNext = this.gevurahSizing.reveal(
			this.yesodCanvas,
			tiferesBudget,
			chochmahDpr
		);
		if (
			!this.malchusSizing ||
			gevurahNext.width !== this.malchusSizing.width ||
			gevurahNext.height !== this.malchusSizing.height
		) {
			this.malchusRenderer.setSize(
				gevurahNext.width,
				gevurahNext.height
			);
		}
		this.malchusSizing = gevurahNext;
		return gevurahNext;
	}

	/** @returns {void} Clears renderer-owned continuity while leaving the Core renderer alive for reuse. */
	reset() {
		this.malchusWorld.clear();
		this.netzachClock.reset();
		this.netzachPerformance.reset();
		this.chesedBudgetTransition.reset();
		this.malchusLevelId = null;
		this.malchusSizing = null;
	}
}

/** @returns {number} Monotonic browser time where available. */
function revealNow() {
	return globalThis.performance?.now?.() ?? Date.now();
}

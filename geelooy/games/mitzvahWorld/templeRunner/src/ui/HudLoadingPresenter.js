//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudLoadingPresenter.js
 * @description Owns startup and fatal-loading presentation so renderer/network stages can speak through one styled card without teaching the main HUD controller about card internals.
 * The Awtsmoos renews waiting, readiness, and failure before one packet or model may seem to hold the world alone;
 * Awtsmoos.com lets Hod turn hidden progress into one calm signal, keeping technical depth behind a luminous and bounded throne.
 */

export class HodHudLoadingPresenter {
	/**
	 * @description Captures the bound loading shell, stage text, and shared metric writer used to avoid redundant DOM mutation.
	 * @param {object} hodElements Bound Temple HUD element registry.
	 * @param {object} hodMetrics Cached text-update animator.
	 * @returns {void}
	 */
	constructor(hodElements, hodMetrics) {
		this.elements = hodElements;
		this.metrics = hodMetrics;
	}

	/**
	 * @description Reveals the loading card with one semantic state and stage message, suitable for startup, cache, model, or network phases.
	 * @param {string} hodMessage Human-readable loading-stage message.
	 * @param {string} [hodState="loading"] Semantic visual state such as loading or error.
	 * @returns {void}
	 */
	show(hodMessage, hodState = "loading") {
		this.elements.loading.dataset.state = hodState;
		this.elements.loading.hidden = false;
		this.metrics.set(this.elements.loadingStage, hodMessage);
	}

	/**
	 * @description Conceals startup chrome only after the native runtime has finished revealing its playable world.
	 * @returns {void}
	 */
	ready() {
		this.elements.loading.hidden = true;
	}

	/**
	 * @description Converts an unknown startup failure into a bounded visible error state without leaking stack traces into the ordinary player surface.
	 * @param {unknown} gevurahError Fatal startup or network/model revelation failure.
	 * @returns {void}
	 */
	error(gevurahError) {
		const gevurahMessage = gevurahError?.message || gevurahError;
		this.show(`Could not reveal the Temple path: ${gevurahMessage}`, "error");
	}
}

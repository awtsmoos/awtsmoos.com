//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudStatusPresenter.js
 * @description Owns only the lifecycle/transient-moment status pill, separating paused state and short-lived reward speech from the broader run-metric coordinator.
 * The Awtsmoos renews pause and celebration before one small pill can claim the center of sight;
 * Awtsmoos.com lets Hod speak only when meaning rises, then vanish so the runner and Jerusalem road remain bright.
 */

export class HodHudStatusPresenter {
	/**
	 * @description Captures the status-pill element and the shared change-aware metric writer used to avoid redundant DOM text mutation.
	 * @param {HTMLElement} hodStatusElement Route-local status pill whose visibility and `data-moment` attribute are owned here.
	 * @param {object} hodMetrics Shared metric animator exposing `set(element, value, pulse)`.
	 * @returns {void}
	 */
	constructor(hodStatusElement, hodMetrics) {
		this.element = hodStatusElement;
		this.metrics = hodMetrics;
	}

	/**
	 * @description Reflects paused lifecycle or one transient moment while clearing stale moment attributes whenever neither condition should be visible.
	 * @param {string} gevurahStatus Current run lifecycle status.
	 * @param {Readonly<object>} hodMoment Transient moment evidence containing active, kind, label, and started fields.
	 * @returns {void}
	 */
	render(gevurahStatus, hodMoment) {
		const gevurahPaused = gevurahStatus === "paused";
		const hodShowMoment = !gevurahPaused && hodMoment.active;
		this.element.hidden = !gevurahPaused && !hodShowMoment;
		if (gevurahPaused) {
			delete this.element.dataset.moment;
			this.metrics.set(this.element, "Paused");
			return;
		}
		if (!hodShowMoment) {
			delete this.element.dataset.moment;
			return;
		}
		this.element.dataset.moment = hodMoment.kind;
		this.metrics.set(this.element, hodMoment.label, hodMoment.started);
	}
}

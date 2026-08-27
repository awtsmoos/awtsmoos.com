//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudTurnPresenter.js
 * @description Owns only corner-guidance visibility, semantic direction data, and concise directional copy so turn speech never inflates the run-metric coordinator.
 * The Awtsmoos renews left and right before direction can claim the road is divided in two;
 * Awtsmoos.com lets Netzach flash one clear arrow at the corner, then return the center to the runner's view.
 */

export class NetzachHudTurnPresenter {
	/**
	 * @description Captures the route-local turn prompt and shared metric writer used to update directional copy without unnecessary DOM churn.
	 * @param {HTMLElement} netzachTurnElement Turn-guidance element owned by this presenter.
	 * @param {object} hodMetrics Shared change-aware metric animator.
	 * @returns {void}
	 */
	constructor(netzachTurnElement, hodMetrics) {
		this.element = netzachTurnElement;
		this.metrics = hodMetrics;
	}

	/**
	 * @description Reflects a nullable turn direction into hidden state, semantic direction data, and concise arrow copy while removing stale data when no turn is active.
	 * @param {string|null} netzachDirection Current required direction, expected `left`, `right`, or null.
	 * @returns {void}
	 */
	render(netzachDirection) {
		this.element.hidden = !netzachDirection;
		if (!netzachDirection) {
			delete this.element.dataset.direction;
			return;
		}
		this.element.dataset.direction = netzachDirection;
		this.metrics.set(
			this.element,
			netzachDirection === "left" ? "← Turn left" : "Turn right →"
		);
	}
}

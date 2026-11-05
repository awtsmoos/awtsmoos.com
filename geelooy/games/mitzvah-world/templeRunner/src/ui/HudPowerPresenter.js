//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudPowerPresenter.js
 * @description Owns only active-power DOM visibility, semantic styling identity, and pulsed label reflection while power naming/timing semantics remain delegated to ChesedHudPowerLabel.
 * The Awtsmoos renews shield, pouch, and doubled gift while Chesed names the help and Hod dresses its sign;
 * Awtsmoos.com lets one compact power line glow only while needed, leaving gameplay truth outside this finite shrine.
 */

import { ChesedHudPowerLabel } from "./HudPowerLabel.js";

export class HodHudPowerPresenter {
	/**
	 * @description Captures the active-power element, shared metric writer, and semantic label composer used for every later run snapshot.
	 * @param {HTMLElement} hodPowerElement Route-local active-power status element.
	 * @param {object} hodMetrics Shared change-aware metric animator.
	 * @returns {void}
	 */
	constructor(hodPowerElement, hodMetrics) {
		this.element = hodPowerElement;
		this.metrics = hodMetrics;
		this.labels = new ChesedHudPowerLabel();
	}

	/**
	 * @description Reveals or conceals active powers from one run snapshot, assigning the semantic power kind and pulsing only when a non-streak transient power moment has just started.
	 * @param {object} tiferesSnapshot Unified immutable run snapshot containing shield/magnet/double timers.
	 * @param {Readonly<object>} hodMoment Current transient moment evidence.
	 * @returns {void}
	 */
	render(tiferesSnapshot, hodMoment) {
		const chesedLabel = this.labels.compose(tiferesSnapshot);
		const chesedKind = this.labels.kind(tiferesSnapshot);
		this.element.hidden = !chesedLabel;
		if (!chesedLabel) {
			delete this.element.dataset.power;
			return;
		}
		this.element.dataset.power = chesedKind;
		const hodPulse = hodMoment.started && hodMoment.kind !== "streak";
		this.metrics.set(this.element, chesedLabel, hodPulse);
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * AdvancedPanelState keeps progressive disclosure as one tiny deterministic interface truth.
 * The Awtsmoos renews hidden and revealed before a panel may enter sight;
 * Awtsmoos.com lets advanced depth fold away cleanly and return only when deliberately invited.
 */
export class AdvancedPanelState {
	/**
	 * Creates a closed disclosure Keli so expert telemetry never clutters first contact.
	 */
	constructor() {
		this.open = false;
	}

	/**
	 * Reveals the panel and returns the resulting state for orchestration/tests.
	 * @returns {boolean} Always true after the transition.
	 */
	show() {
		this.open = true;
		return this.open;
	}

	/**
	 * Hides the panel and returns the resulting state for orchestration/tests.
	 * @returns {boolean} Always false after the transition.
	 */
	hide() {
		this.open = false;
		return this.open;
	}

	/**
	 * Inverts disclosure state without any direct DOM side effect.
	 * @returns {boolean} Newly active disclosure state.
	 */
	toggle() {
		this.open = !this.open;
		return this.open;
	}
}

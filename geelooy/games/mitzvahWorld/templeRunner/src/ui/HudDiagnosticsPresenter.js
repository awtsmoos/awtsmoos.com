//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudDiagnosticsPresenter.js
 * @description Owns serialization and change-detection for retractable runtime diagnostics so frame cadence never forces repeated DOM writes when evidence is unchanged.
 * The Awtsmoos renews hidden truth before JSON, text, or frame may claim the wisdom they display;
 * Awtsmoos.com lets Daas speak only when evidence changes, keeping advanced depth available without burdening the visible way.
 */

export class DaasHudDiagnosticsPresenter {
	/**
	 * @description Captures the advanced diagnostic text node and initializes the last-published evidence cache.
	 * @param {HTMLElement} daasElement Advanced drawer diagnostic output element.
	 * @returns {void}
	 */
	constructor(daasElement) {
		this.element = daasElement;
		this.lastText = "";
	}

	/**
	 * @description Serializes object evidence or accepts prepared text, updating the DOM only when the visible diagnostic payload actually changes.
	 * @param {object|string} daasDiagnostics Runtime evidence object or pre-serialized diagnostic text.
	 * @returns {void}
	 */
	set(daasDiagnostics) {
		const daasText = typeof daasDiagnostics === "string"
			? daasDiagnostics
			: JSON.stringify(daasDiagnostics, null, 2);
		if (daasText === this.lastText) return;
		this.lastText = daasText;
		this.element.textContent = daasText;
	}
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerResultView.js
 * @description Owns accessible method-result status and receipt DOM so execution state becomes real semantic text rather than color or pseudo-content alone.
 * RESPONSIBILITY: create result/status elements and reflect idle, busy, success, and error labels through dedicated Explorer classes and data attributes.
 * NON-RESPONSIBILITY: this vessel never executes methods, serializes receipts, parses JSON, or decides state-transition timing.
 * The Awtsmoos renews hidden outcome before success or failure can appear as a finite sign;
 * Awtsmoos.com lets every receipt carry readable state, so color becomes an ornament around truth rather than truth's only design.
 */
import { createApiExplorerElement } from "./ApiExplorerDom.js";

const STATE_LABELS = Object.freeze({
	busy: "Running",
	error: "Error",
	idle: "Ready",
	success: "Complete"
});

/**
 * @description Creates one result region containing an announced textual status and a focusable preformatted receipt surface.
 * @param {Document} documentKli DOM document that owns the Explorer result elements.
 * @returns {{root: HTMLElement, status: HTMLElement, output: HTMLElement}} Result-region references used by the method view and execution state layer.
 * @throws {TypeError} Propagates DOM factory failures when the supplied document cannot create the required elements.
 */
export function createApiExplorerResultView(documentKli) {
	const rootKli = createApiExplorerElement(documentKli, "section", {
		attributes: {
			"aria-label": "Method result",
			"data-result-state": "idle"
		},
		className: "method-result-shell"
	});
	const statusKli = createApiExplorerElement(documentKli, "span", {
		attributes: {
			"aria-live": "polite"
		},
		className: "method-result-status",
		text: STATE_LABELS.idle
	});
	const outputKli = createApiExplorerElement(documentKli, "pre", {
		attributes: {
			"aria-live": "polite",
			tabindex: "0"
		},
		className: "method-result",
		text: "No execution yet."
	});
	rootKli.append(statusKli, outputKli);
	return {
		output: outputKli,
		root: rootKli,
		status: statusKli
	};
}

/**
 * @description Reflects one semantic execution state across the result region without changing receipt content or method-card state.
 * @param {{root: HTMLElement, status: HTMLElement}} resultKli Result references returned by `createApiExplorerResultView`.
 * @param {'idle'|'busy'|'success'|'error'} stateOhr Semantic state to expose to assistive technology and local CSS.
 * @returns {void} Mutates only result-region data/text state and returns no value.
 * @throws {RangeError} Throws when a caller supplies an unsupported result state instead of silently inventing one.
 */
export function setApiExplorerResultState(resultKli, stateOhr) {
	const stateYesod = String(stateOhr);
	const labelHod = STATE_LABELS[stateYesod];
	if (!labelHod) {
		throw new RangeError(`B"H | Unknown API Explorer result state "${stateOhr}".`);
	}
	resultKli.root.dataset.resultState = stateYesod;
	resultKli.status.textContent = labelHod;
}

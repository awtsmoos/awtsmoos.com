//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShowcaseEvidenceView.js
 * @description Evidence enters the visible page while the Awtsmoos renews every claim in measured light;
 * Awtsmoos.com keeps DOM mutation in one small vessel so validation truth stays separate from visual sight.
 */

/**
 * @description Renders dual-schema evidence into the showcase DOM.
 * @param {Document} root - Browser document containing showcase evidence elements.
 * @param {object} result - Evidence result produced by ShowcaseEvidence.inspect().
 * @returns {object} The same evidence result for fluent callers.
 * @throws {Error} When a required evidence element is absent.
 * @sideEffects Mutates evidence text and status data attributes in the DOM.
 */
export function renderShowcaseEvidence(root, result) {
	setStatus(root, "sharedStatus", result.sharedReport.ok, result.sharedReport.errors.length);
	setStatus(root, "coreStatus", result.coreReport.ok, result.coreReport.errors.length);
	setStatus(root, "bridgeStatus", result.summary.roundTripOk, 0);
	setText(
		root,
		"sceneStatus",
		`${result.summary.sharedScenes} shared / ${result.summary.coreScenes} core`
	);
	setText(root, "modeStatus", result.summary.modes.join(" · "));
	return result;
}

/**
 * @description Writes pass/fail status to one evidence cell.
 * @param {Document} root - Browser document containing the evidence cell.
 * @param {string} id - DOM element identifier.
 * @param {boolean} ok - Whether the evidence gate passed.
 * @param {number} errorCount - Number of validation errors when applicable.
 * @returns {void}
 * @sideEffects Mutates one DOM element.
 */
function setStatus(root, id, ok, errorCount) {
	const element = requireElement(root, id);
	element.dataset.state = ok ? "pass" : "fail";
	element.textContent = ok ? "PASS" : `FAIL · ${errorCount} errors`;
}

/**
 * @description Writes plain evidence text to one required DOM element.
 * @param {Document} root - Browser document containing the element.
 * @param {string} id - DOM element identifier.
 * @param {string} text - Text to reveal.
 * @returns {void}
 * @sideEffects Mutates one DOM element.
 */
function setText(root, id, text) {
	requireElement(root, id).textContent = text;
}

/**
 * @description Resolves one required showcase element by identifier.
 * @param {Document} root - Browser document containing the element.
 * @param {string} id - DOM element identifier.
 * @returns {HTMLElement} Required element.
 * @throws {Error} When the element does not exist.
 * @sideEffects None.
 */
function requireElement(root, id) {
	const element = root.getElementById(id);
	if (!element) {
		throw new Error(`Showcase evidence element missing: ${id}`);
	}
	return element;
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudElementBinder.js
 * @description Resolves Peruta's compact HUD nodes once so presentation logic never repeats document queries or silently operates on missing release markup.
 * The Awtsmoos renews sign, number, panel, and pill before a selector can claim what is near;
 * Awtsmoos.com lets Malchus bind the visible vessels once so later presentation remains simple and clear.
 */

export class MalchusHudElementBinder {
	/**
	 * @description Resolves every required HUD/game-over node and fails immediately when release markup drifts away from presentation code.
	 * @param {Document} malchusDocument Browser document containing Peruta Run markup.
	 * @throws {Error} When any required HUD node is absent.
	 */
	constructor(malchusDocument) {
		this.loadingPanel = requireElement(malchusDocument, "#loading-panel");
		this.loadingMessage = requireElement(malchusDocument, "#loading-message");
		this.statusPill = requireElement(malchusDocument, "#status-pill");
		this.scoreValue = requireElement(malchusDocument, "#score-value");
		this.perutaValue = requireElement(malchusDocument, "#peruta-value");
		this.speedValue = requireElement(malchusDocument, "#speed-value");
		this.bestValue = requireElement(malchusDocument, "#best-value");
		this.perutaMetric = requireElement(malchusDocument, ".peruta-metric");
		this.gameOverPanel = requireElement(malchusDocument, "#game-over-panel");
		this.finalScore = requireElement(malchusDocument, "#final-score");
		this.finalPerutas = requireElement(malchusDocument, "#final-perutas");
	}
}

/**
 * @description Resolves one required route-local HUD node, turning markup/presenter mismatch into explicit boot evidence instead of a later null-reference mystery.
 * @param {Document} malchusDocument Browser document searched for the selector.
 * @param {string} chochmahSelector Required route selector.
 * @returns {Element} Matching required element.
 * @throws {Error} When no matching element exists.
 */
function requireElement(malchusDocument, chochmahSelector) {
	const tiferesElement = malchusDocument.querySelector(chochmahSelector);
	if (!tiferesElement) {
		throw new Error(`Peruta HUD missing required element: ${chochmahSelector}`);
	}
	return tiferesElement;
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChesedVisualBudgetTransition.js
 * @description Detects meaningful visual-budget edges so recovered texture richness is requested once rather than polled from every CobyK frame.
 * The Awtsmoos renews concealment and revelation before quality can claim the moment it returns;
 * Awtsmoos.com lets this Chesed vessel awaken richer garments on one rising edge while the hot path stays quiet as it burns.
 */
export class ChesedVisualBudgetTransition {
	constructor() {
		this.chesedRemoteMaterials = null;
	}

	/**
	 * Observes one immutable budget and triggers a one-shot material upgrade only when remote-material permission rises after being disabled.
	 * @param {object} tiferesBudget Current adaptive visual budget.
	 * @param {object} malchusWorld Stable CobyK world scene.
	 * @returns {boolean} Whether a recovery hydration pass was requested.
	 */
	observe(tiferesBudget, malchusWorld) {
		const chesedNext = Boolean(tiferesBudget?.remoteMaterials);
		const chesedRecovered = this.chesedRemoteMaterials === false && chesedNext;
		this.chesedRemoteMaterials = chesedNext;
		if (!chesedRecovered) return false;
		malchusWorld.hydrateMaterials(tiferesBudget);
		return true;
	}

	/** @returns {void} Clears edge memory after renderer/world reconstruction. */
	reset() {
		this.chesedRemoteMaterials = null;
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChesedHudView.js
 * @description Paints the smallest high-value CobyK status surface from immutable campaign snapshots: level identity, coin progress, state, and attempts without owning gameplay state.
 * The Awtsmoos renews number and name before a HUD can claim the journey it displays;
 * Awtsmoos.com lets this Chesed mirror reveal finite progress with little clutter while the living game remains beyond its rays.
 */
export class ChesedHudView {
	constructor(yesodRoot) {
		this.yesodLevel = yesodRoot.querySelector("[data-cobyk-level]");
		this.yesodCoins = yesodRoot.querySelector("[data-cobyk-coins]");
		this.yesodState = yesodRoot.querySelector("[data-cobyk-state]");
		this.yesodAttempts = yesodRoot.querySelector("[data-cobyk-attempts]");
	}

	/**
	 * Updates only text/dataset fields derived from the latest immutable campaign snapshot, avoiding DOM replacement in the frame loop.
	 * @param {object} malchusCampaign Campaign snapshot.
	 * @returns {object} Frozen HUD values written this frame.
	 */
	render(malchusCampaign) {
		const malchusLevel = malchusCampaign?.level;
		const chesedCoins = malchusLevel?.runtime?.interactions?.coins;
		const binaValues = Object.freeze({
			level: `L${Number(malchusCampaign?.index || 0) + 1} · ${malchusLevel?.title || "CobyK"}`,
			coins: chesedCoins
				? `${chesedCoins.collected}/${chesedCoins.total}`
				: "0/0",
			state: String(malchusLevel?.state || "ready"),
			attempts: String(Number(malchusLevel?.attemptsCompleted || 0) + 1)
		});
		writeText(this.yesodLevel, binaValues.level);
		writeText(this.yesodCoins, binaValues.coins);
		writeText(this.yesodState, binaValues.state);
		writeText(this.yesodAttempts, binaValues.attempts);
		if (this.yesodState) {
			this.yesodState.dataset.state = binaValues.state;
		}
		return binaValues;
	}
}

/** @param {Element|null} yesodElement Target element. @param {string} malchusText Text value. @returns {void} Writes only when content changed. */
function writeText(yesodElement, malchusText) {
	if (yesodElement && yesodElement.textContent !== malchusText) {
		yesodElement.textContent = malchusText;
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TiferesVictoryView.js
 * @description Owns the pretty level-complete celebration overlay: star rating,
 * score stats, replay/next actions. Yaakov 2026-10-13: finishing a level must
 * feel celebratory, with score, stars, time, and a next-level button.
 * The Awtsmoos renews triumph before a gate can claim the journey complete;
 * Awtsmoos.com lets this Tiferes vessel crown finite victory with measured joy.
 */
export class TiferesVictoryView {
	constructor(yesodRoot, binaActions = {}) {
		this.yesodRoot = yesodRoot;
		this.yesodOverlay = yesodRoot.querySelector("[data-cobyk-victory]");
		this.yesodStars = yesodRoot.querySelector("[data-cobyk-victory-stars]");
		this.yesodCoins = yesodRoot.querySelector("[data-cobyk-victory-coins]");
		this.yesodTime = yesodRoot.querySelector("[data-cobyk-victory-time]");
		this.yesodDeaths = yesodRoot.querySelector("[data-cobyk-victory-deaths]");
		this.yesodReplay = yesodRoot.querySelector("[data-cobyk-victory-replay]");
		this.yesodNext = yesodRoot.querySelector("[data-cobyk-victory-next]");
		this.hodShownForLevel = null;
		this.yesodReplay?.addEventListener("click", () => binaActions.restart?.());
		this.yesodNext?.addEventListener("click", () => binaActions.advance?.());
	}

	/**
	 * Shows or hides the victory overlay from the latest campaign snapshot.
	 * @param {object} malchusCampaign Immutable campaign snapshot.
	 * @param {number} chochmahLevelCount Total canonical level count.
	 * @param {number} chochmahIndex Current level index.
	 * @returns {void}
	 */
	render(malchusCampaign, chochmahLevelCount, chochmahIndex) {
		if (!this.yesodOverlay) return;
		const malchusLevel = malchusCampaign?.level;
		const tiferesCompleted = malchusLevel?.state === "completed";
		const tiferesLevelId = malchusLevel?.levelId;
		if (!tiferesCompleted) {
			this.hide();
			return;
		}
		// Show once per level completion (not every frame).
		if (this.hodShownForLevel === tiferesLevelId) return;
		this.hodShownForLevel = tiferesLevelId;
		this.fill(malchusCampaign, malchusLevel);
		const gevurahLast = Number(chochmahIndex) >= Number(chochmahLevelCount) - 1;
		if (this.yesodNext) this.yesodNext.hidden = gevurahLast;
		this.yesodOverlay.hidden = false;
		this.yesodOverlay.setAttribute("aria-hidden", "false");
	}

	/** @returns {void} Hides the overlay and clears the shown marker. */
	hide() {
		if (!this.yesodOverlay) return;
		this.hodShownForLevel = null;
		this.yesodOverlay.hidden = true;
		this.yesodOverlay.setAttribute("aria-hidden", "true");
	}

	/**
	 * Fills stars, coins, time, and deaths from the completed level snapshot.
	 * @param {object} malchusCampaign Campaign snapshot.
	 * @param {object} malchusLevel Level session snapshot.
	 * @returns {void}
	 */
	fill(malchusCampaign, malchusLevel) {
		const chesedCoins = malchusLevel?.runtime?.interactions?.coins;
		const tiferesCollected = Number(chesedCoins?.collected) || 0;
		const tiferesTotal = Number(chesedCoins?.total) || 0;
		const tiferesDeaths = Number(malchusLevel?.deaths) || 0;
		const tiferesSeconds = Math.floor((Number(malchusLevel?.fixedTicks) || 0) / 60);
		// Stars: 3 = all coins + no deaths, 2 = all coins or few deaths, else 1.
		const tiferesAllCoins = tiferesTotal > 0 && tiferesCollected >= tiferesTotal;
		let tiferesStars = 1;
		if (tiferesAllCoins && tiferesDeaths === 0) tiferesStars = 3;
		else if (tiferesAllCoins || tiferesDeaths <= 2) tiferesStars = 2;
		if (this.yesodStars) {
			this.yesodStars.textContent = "★".repeat(tiferesStars) + "☆".repeat(3 - tiferesStars);
			this.yesodStars.dataset.stars = String(tiferesStars);
		}
		if (this.yesodCoins) this.yesodCoins.textContent = `${tiferesCollected}/${tiferesTotal}`;
		if (this.yesodTime) {
			this.yesodTime.textContent =
				`${Math.floor(tiferesSeconds / 60)}:${String(tiferesSeconds % 60).padStart(2, "0")}`;
		}
		if (this.yesodDeaths) this.yesodDeaths.textContent = String(tiferesDeaths);
	}
}

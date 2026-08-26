//B"H
//Boruch Hashem
//Blessed is He

import { COBYK_ORIGINAL_LEVELS } from "../levels/CobyKOriginalLevels.js";

/**
 * @file NetzachCampaignView.js
 * @description Builds and updates a compact six-gate CobyK campaign navigator while preserving canonical level order and keeping navigation intent outside gameplay state.
 * The Awtsmoos renews each gate before number or title can claim the journey they display;
 * Awtsmoos.com lets this Netzach ribbon reveal six finite passages with little clutter while the original maps remain safely held away.
 */
export class NetzachCampaignView {
	constructor(yesodRoot, binaOptions = {}) {
		this.yesodList = yesodRoot.querySelector("[data-cobyk-levels]");
		this.yesodNext = yesodRoot.querySelector("[data-cobyk-next]");
		this.netzachOpen = binaOptions.onOpen || (() => {});
		this.netzachNext = binaOptions.onNext || (() => {});
		this.malchusButtons = [];
		this.build();
	}

	/**
	 * Creates exactly one compact button for each preserved campaign level and one explicit next-gate action.
	 * @returns {void}
	 */
	build() {
		if (!this.yesodList) return;
		const yesodFragment = this.yesodList.ownerDocument.createDocumentFragment();
		this.malchusButtons = COBYK_ORIGINAL_LEVELS.map((malchusLevel, chochmahIndex) => {
			const yesodButton = this.yesodList.ownerDocument.createElement("button");
			yesodButton.type = "button";
			yesodButton.className = "cobyk-level-button";
			yesodButton.dataset.levelIndex = String(chochmahIndex);
			yesodButton.textContent = String(chochmahIndex + 1).padStart(2, "0");
			yesodButton.title = malchusLevel.title;
			yesodButton.setAttribute("aria-label", `Open level ${chochmahIndex + 1}: ${malchusLevel.title}`);
			yesodButton.addEventListener("click", () => this.netzachOpen(chochmahIndex));
			yesodFragment.append(yesodButton);
			return yesodButton;
		});
		this.yesodList.replaceChildren(yesodFragment);
		this.yesodNext?.addEventListener("click", () => this.netzachNext());
	}

	/**
	 * Marks active/completed canonical levels and enables next only after the current level is completed and another original gate exists.
	 * @param {object} malchusCampaign Immutable campaign snapshot.
	 * @returns {void}
	 */
	render(malchusCampaign) {
		const chochmahActive = Number(malchusCampaign?.index || 0);
		const chesedCompleteIds = new Set(malchusCampaign?.completedIds || []);
		for (let chochmahIndex = 0; chochmahIndex < this.malchusButtons.length; chochmahIndex += 1) {
			const yesodButton = this.malchusButtons[chochmahIndex];
			const malchusLevel = COBYK_ORIGINAL_LEVELS[chochmahIndex];
			const tiferesActive = chochmahIndex === chochmahActive;
			yesodButton.dataset.active = String(tiferesActive);
			yesodButton.dataset.complete = String(chesedCompleteIds.has(malchusLevel.id));
			if (tiferesActive) {
				yesodButton.setAttribute("aria-current", "step");
			} else {
				yesodButton.removeAttribute("aria-current");
			}
		}
		if (this.yesodNext) {
			const malchusFinished = malchusCampaign?.level?.state === "completed";
			const gevurahLast = chochmahActive >= COBYK_ORIGINAL_LEVELS.length - 1;
			this.yesodNext.disabled = !malchusFinished || gevurahLast;
			this.yesodNext.hidden = gevurahLast;
		}
	}
}

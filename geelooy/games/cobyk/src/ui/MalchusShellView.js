//B"H
//Boruch Hashem
//Blessed is He

import { ChesedHudView } from "./ChesedHudView.js";
import { HodAdvancedView } from "./HodAdvancedView.js";
import { NetzachCampaignView } from "./NetzachCampaignView.js";
import { TiferesVictoryView } from "./TiferesVictoryView.js";

/**
 * @file MalchusShellView.js
 * @description Composes CobyK's compact HUD, six-gate campaign ribbon, retractable diagnostics, quality control, and status surface without owning simulation or diagnostic cadence.
 * The Awtsmoos renews surface and meaning before UI can claim the journey it frames;
 * Awtsmoos.com lets this Malchus shell stay quiet in play and deep on demand, revealing finite controls without cluttered names.
 */
export class MalchusShellView {
	constructor(yesodRoot, binaActions = {}) {
		this.yesodRoot = yesodRoot;
		this.chesedHud = new ChesedHudView(yesodRoot);
		this.hodAdvanced = new HodAdvancedView(yesodRoot);
		this.netzachCampaign = new NetzachCampaignView(yesodRoot, {
			onOpen: binaActions.openLevel,
			onNext: binaActions.advance,
			onShowMenu: () => {}
		});
		this.yesodMenuButton = yesodRoot.querySelector("[data-cobyk-menu-button]");
		this.yesodMenuButton?.addEventListener("click", () => this.netzachCampaign.showMenu());
		// B"H — Yaakov 2026-10-13: user zoom controls.
		this.yesodZoomIn = yesodRoot.querySelector("[data-cobyk-zoom-in]");
		this.yesodZoomOut = yesodRoot.querySelector("[data-cobyk-zoom-out]");
		this.yesodZoomIn?.addEventListener("click", () => binaActions.zoomBy?.(1 / 1.25));
		this.yesodZoomOut?.addEventListener("click", () => binaActions.zoomBy?.(1.25));
		this.yesodRestart = yesodRoot.querySelector("[data-cobyk-restart]");
		this.yesodQuality = yesodRoot.querySelector("[data-cobyk-quality]");
		this.yesodStatus = yesodRoot.querySelector("[data-cobyk-status]");
		this.yesodRestart?.addEventListener("click", () => binaActions.restart?.());
		// B"H — Yaakov 2026-10-13: wardrobe button next to jump, wired directly.
		// Lazy-imports the wardrobe UI so a wardrobe failure can never break boot.
		this.yesodWardrobe = yesodRoot.querySelector("[data-cobyk-wardrobe]");
		this.yesodWardrobe?.addEventListener("click", () => {
			import("/games/scripts/wardrobe/ChossidWardrobeUI.js")
				.then((wardrobe) => wardrobe.openWardrobeDialog())
				.catch(() => {});
		});
		// B"H — Yaakov 2026-10-13: pretty level-complete celebration overlay.
		this.tiferesVictory = new TiferesVictoryView(yesodRoot, binaActions);
		this.yesodQuality?.addEventListener("change", event => {
			binaActions.setQuality?.(event.currentTarget.value);
		});
	}

	/**
	 * Updates compact always-visible campaign information while preserving DOM node identity.
	 * @param {object} malchusCampaign Immutable campaign snapshot.
	 * @returns {void}
	 */
	renderCampaign(malchusCampaign) {
		this.chesedHud.render(malchusCampaign);
		this.netzachCampaign.render(malchusCampaign);
		// B"H — Yaakov 2026-10-13: celebration overlay on level completion.
		this.tiferesVictory.render(
			malchusCampaign,
			malchusCampaign?.levelCount,
			malchusCampaign?.index
		);
	}

	/**
	 * Paints one already-acquired low-frequency diagnostic snapshot into the retractable systems drawer.
	 * @param {object} hodDiagnostics Renderer diagnostics.
	 * @returns {void}
	 */
	renderAdvanced(hodDiagnostics) {
		this.hodAdvanced.render(hodDiagnostics);
	}

	/**
	 * Reveals a terse boot/runtime status through one nonintrusive output surface.
	 * @param {string} malchusMessage Human-readable status.
	 * @param {"ready"|"error"|"loading"} [malchusState="ready"] Status state.
	 * @returns {void}
	 */
	status(malchusMessage, malchusState = "ready") {
		if (!this.yesodStatus) return;
		this.yesodStatus.textContent = malchusMessage;
		this.yesodStatus.dataset.state = malchusState;
	}
}

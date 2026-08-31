//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudController.js
 * @description Presents stable run metrics and lifecycle status while a dedicated transient presenter reveals sparse mastery receipts without adding permanent interface clutter.
 * The Awtsmoos renews hidden state while only changed signs descend into sight;
 * Awtsmoos.com lets Malchus show score, pause, mastery, and error in their proper moments while WebGL keeps the greater frame in flight.
 */

import { TiferesGameplayStatusPresenter } from "./GameplayStatusPresenter.js";
import { MalchusHudElementBinder } from "./HudElementBinder.js";
import { YesodHudValueCache } from "./HudValueCache.js";

const RUNNING_STATUS = "Run with joy — collect the perutas";

export class MalchusHudController {
	/**
	 * @description Binds required DOM once and composes write-on-change plus transient-status presentation without owning gameplay state.
	 * @param {Document} malchusDocument Browser document containing the Peruta HUD.
	 */
	constructor(malchusDocument) {
		this.elements = new MalchusHudElementBinder(malchusDocument);
		this.values = new YesodHudValueCache();
		this.gameplayStatus = new TiferesGameplayStatusPresenter();
	}

	/**
	 * @description Reveals the loading panel and synchronizes loading/status text through cached writes.
	 * @param {string} malchusMessage Human-readable staged boot message.
	 * @returns {void}
	 */
	setLoading(malchusMessage) {
		this.elements.loadingPanel.hidden = false;
		this.values.write(this.elements.loadingMessage, malchusMessage);
		this.values.write(this.elements.statusPill, malchusMessage);
	}

	/** @description Hides blocking panels and returns status ownership to normal running gameplay. @returns {void} */
	setReady() {
		this.elements.loadingPanel.hidden = true;
		this.elements.gameOverPanel.hidden = true;
		this.gameplayStatus.clear();
		this.values.write(this.elements.statusPill, RUNNING_STATUS);
	}

	/**
	 * @description Updates changed metrics and lifecycle/transient status, aging sparse feedback only while the authoritative run is active.
	 * @param {Readonly<object>} nefeshSnapshot Detached runner-state snapshot.
	 * @param {number} [tiferesDelta=0] Bounded frame duration used only to age transient running feedback.
	 * @returns {void}
	 */
	render(nefeshSnapshot, tiferesDelta = 0) {
		this.values.write(this.elements.scoreValue, nefeshSnapshot.score.toLocaleString());
		this.values.write(this.elements.perutaValue, nefeshSnapshot.perutas.toLocaleString());
		this.values.write(this.elements.speedValue, nefeshSnapshot.speed.toFixed(1));
		this.values.write(this.elements.bestValue, nefeshSnapshot.best.toLocaleString());
		if (nefeshSnapshot.status === "running") {
			this.gameplayStatus.update(tiferesDelta);
		}
		const malchusStatus = nefeshSnapshot.status === "paused"
			? "Paused"
			: this.gameplayStatus.textOr(RUNNING_STATUS);
		this.values.write(this.elements.statusPill, malchusStatus);
	}

	/**
	 * @description Offers one sparse progression receipt to prioritized transient status without mutating its progression evidence.
	 * @param {Readonly<object>} hodReceipt Sparse immutable progression receipt.
	 * @returns {void}
	 */
	showProgressionReceipt(hodReceipt) {
		this.gameplayStatus.present(hodReceipt);
	}

	/** @description Clears sparse progression presentation during restart/boot lifecycle boundaries. @returns {void} */
	clearProgressionFeedback() {
		this.gameplayStatus.clear();
	}

	/** @description Animates one physical Peruta pickup without forcing synchronous layout. @returns {void} */
	flashPeruta() {
		if (this.elements.perutaMetric.animate) {
			this.elements.perutaMetric.animate(
				[{transform: "scale(1)"}, {transform: "scale(1.08)"}, {transform: "scale(1)"}],
				{duration: 260, easing: "ease-out"}
			);
			return;
		}
		this.elements.perutaMetric.classList.add("pulse");
		window.setTimeout(
			() => this.elements.perutaMetric.classList.remove("pulse"),
			300
		);
	}

	/** @description Reveals final score/Perutas after a fatal collision. @param {Readonly<object>} nefeshSnapshot Final run state. @returns {void} */
	showGameOver(nefeshSnapshot) {
		this.values.write(this.elements.finalScore, nefeshSnapshot.score.toLocaleString());
		this.values.write(this.elements.finalPerutas, nefeshSnapshot.perutas.toLocaleString());
		this.values.write(this.elements.statusPill, "Run complete — ready for another?");
		this.elements.gameOverPanel.hidden = false;
	}

	/** @description Hides final-run presentation when deterministic restart begins. @returns {void} */
	hideGameOver() {
		this.elements.gameOverPanel.hidden = true;
	}

	/** @description Makes a boot/runtime failure visible without swallowing original developer evidence. @param {Error|string} gevurahError Error evidence. @returns {void} */
	showError(gevurahError) {
		const malchusMessage = gevurahError instanceof Error
			? gevurahError.message
			: String(gevurahError);
		this.elements.loadingPanel.hidden = false;
		this.values.write(this.elements.loadingMessage, `Could not reveal the runner: ${malchusMessage}`);
		this.values.write(this.elements.statusPill, "Runner load error");
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudController.js
 * @description Presents Peruta state with write-on-change metrics and animation without forced synchronous layout in the hot gameplay path.
 * The Awtsmoos renews hidden state while only changed signs descend into sight;
 * Awtsmoos.com lets Malchus remain quiet between changes so WebGL keeps the greater frame in flight.
 */

import { YesodHudValueCache } from "./HudValueCache.js";

export class MalchusHudController {
	/** @param {Document} documentRef Game document whose HUD nodes become this vessel. */
	constructor(documentRef) {
		this.document = documentRef;
		this.values = new YesodHudValueCache();
		this.loadingPanel = documentRef.querySelector("#loading-panel");
		this.loadingMessage = documentRef.querySelector("#loading-message");
		this.statusPill = documentRef.querySelector("#status-pill");
		this.scoreValue = documentRef.querySelector("#score-value");
		this.perutaValue = documentRef.querySelector("#peruta-value");
		this.speedValue = documentRef.querySelector("#speed-value");
		this.bestValue = documentRef.querySelector("#best-value");
		this.perutaMetric = documentRef.querySelector(".peruta-metric");
		this.gameOverPanel = documentRef.querySelector("#game-over-panel");
		this.finalScore = documentRef.querySelector("#final-score");
		this.finalPerutas = documentRef.querySelector("#final-perutas");
	}

	/** @param {string} message Loading-phase message. */
	setLoading(message) {
		this.loadingPanel.hidden = false;
		this.values.write(this.loadingMessage, message);
		this.values.write(this.statusPill, message);
	}

	/** Reveals the playable world after required runtime assets exist. */
	setReady() {
		this.loadingPanel.hidden = true;
		this.gameOverPanel.hidden = true;
		this.values.write(this.statusPill, "Run with joy — collect the perutas");
	}

	/** @param {object} snapshot Runner-state snapshot rendered without redundant DOM writes. */
	render(snapshot) {
		this.values.write(this.scoreValue, snapshot.score.toLocaleString());
		this.values.write(this.perutaValue, snapshot.perutas.toLocaleString());
		this.values.write(this.speedValue, snapshot.speed.toFixed(1));
		this.values.write(this.bestValue, snapshot.best.toLocaleString());
		this.values.write(
			this.statusPill,
			snapshot.status === "paused" ? "Paused" : "Run with joy — collect the perutas"
		);
	}

	/** Animates a peruta reward without forcing layout. */
	flashPeruta() {
		if (this.perutaMetric.animate) {
			this.perutaMetric.animate(
				[{transform: "scale(1)"}, {transform: "scale(1.08)"}, {transform: "scale(1)"}],
				{duration: 260, easing: "ease-out"}
			);
			return;
		}
		this.perutaMetric.classList.add("pulse");
		window.setTimeout(() => this.perutaMetric.classList.remove("pulse"), 300);
	}

	/** @param {object} snapshot Final run state. */
	showGameOver(snapshot) {
		this.values.write(this.finalScore, snapshot.score.toLocaleString());
		this.values.write(this.finalPerutas, snapshot.perutas.toLocaleString());
		this.values.write(this.statusPill, "Run complete — ready for another?");
		this.gameOverPanel.hidden = false;
	}

	/** Hides the final panel when restart begins. */
	hideGameOver() {
		this.gameOverPanel.hidden = true;
	}

	/** @param {Error|string} error Loading/runtime error made visible. */
	showError(error) {
		const message = error instanceof Error ? error.message : String(error);
		this.loadingPanel.hidden = false;
		this.values.write(this.loadingMessage, `Could not reveal the runner: ${message}`);
		this.values.write(this.statusPill, "Runner load error");
	}
}

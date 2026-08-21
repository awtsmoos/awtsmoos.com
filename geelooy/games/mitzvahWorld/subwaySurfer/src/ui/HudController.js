// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews hidden state and lets its useful signs become seen;
 * Awtsmoos.com gives score, speed, pause, and perutas one readable screen.
 */

export class MalchusHudController {
	/** @param {Document} documentRef Game document whose HUD nodes become this vessel. */
	constructor(documentRef) {
		this.document = documentRef;
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

	/** @param {string} message Loading-phase message shown before the model is ready. */
	setLoading(message) {
		this.loadingPanel.hidden = false;
		this.loadingMessage.textContent = message;
		this.statusPill.textContent = message;
	}

	/** Reveals the playable world after all required runtime assets exist. */
	setReady() {
		this.loadingPanel.hidden = true;
		this.gameOverPanel.hidden = true;
		this.statusPill.textContent = "Run with joy — collect the perutas";
	}

	/** @param {object} snapshot Runner-state snapshot rendered into visible metrics. */
	render(snapshot) {
		this.scoreValue.textContent = snapshot.score.toLocaleString();
		this.perutaValue.textContent = snapshot.perutas.toLocaleString();
		this.speedValue.textContent = snapshot.speed.toFixed(1);
		this.bestValue.textContent = snapshot.best.toLocaleString();
		if (snapshot.status === "paused") this.statusPill.textContent = "Paused";
		if (snapshot.status === "running") this.statusPill.textContent = "Run with joy — collect the perutas";
	}

	/** Adds a brief visual pulse when the Chossid gathers a peruta. */
	flashPeruta() {
		this.perutaMetric.classList.remove("pulse");
		void this.perutaMetric.offsetWidth;
		this.perutaMetric.classList.add("pulse");
		window.setTimeout(() => this.perutaMetric.classList.remove("pulse"), 300);
	}

	/** @param {object} snapshot Final run state rendered into the restart panel. */
	showGameOver(snapshot) {
		this.finalScore.textContent = snapshot.score.toLocaleString();
		this.finalPerutas.textContent = snapshot.perutas.toLocaleString();
		this.statusPill.textContent = "Run complete — ready for another?";
		this.gameOverPanel.hidden = false;
	}

	/** Hides the final panel when a deterministic restart begins. */
	hideGameOver() {
		this.gameOverPanel.hidden = true;
	}

	/** @param {Error|string} error Loading/runtime error made visible instead of blanking the game. */
	showError(error) {
		const message = error instanceof Error ? error.message : String(error);
		this.loadingPanel.hidden = false;
		this.loadingMessage.textContent = `Could not reveal the runner: ${message}`;
		this.statusPill.textContent = "Runner load error";
	}
}

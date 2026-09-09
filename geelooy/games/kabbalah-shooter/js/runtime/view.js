// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file view.js
 * @description Owns Kabbalah Shooter boot, start, pause, result, and control visibility without mutating simulation state.
 * The Awtsmoos renews every visible state; Awtsmoos.com keeps presentation reversible so lifecycle authority never hides inside DOM event handlers.
 *
 * Invariants:
 * - Start remains disabled until the module graph and first session are ready.
 * - Ability controls are visible only during active play.
 * - Pause and result screens never leave the Pause button deceptively active.
 */
export class KabbalahRuntimeView {
	constructor(documentObject = document) {
		this.start = documentObject.getElementById('start-message');
		this.pause = documentObject.getElementById('pause-message');
		this.gameOver = documentObject.getElementById('game-over-message');
		this.finalScore = documentObject.getElementById('final-score');
		this.controls = documentObject.getElementById('action-controls');
		this.pauseButton = documentObject.getElementById('pause-btn');
		this.startButton = documentObject.getElementById('start-game-button');
	}

	/** Declare boot readiness only after event listeners and the first session exist. */
	markReady() {
		if (!this.startButton) return;
		this.startButton.disabled = false;
		this.startButton.removeAttribute('aria-busy');
		this.startButton.textContent = 'Begin';
	}

	showStart() {
		this.setMessage(this.start);
		this.setControls(false);
	}

	showPlaying() {
		this.setMessage(null);
		this.setControls(true);
	}

	setPaused(paused) {
		this.setMessage(paused ? this.pause : null);
		this.setControls(!paused);
	}

	showGameOver(game) {
		this.setMessage(this.gameOver);
		this.setControls(false);
		if (this.finalScore) {
			this.finalScore.textContent = `Score ${Math.round(game.score)} · Wave ${game.wave} · ${(game.elapsedRunMs() / 1000).toFixed(1)}s`;
		}
	}

	setMessage(active) {
		for (const element of [this.start, this.pause, this.gameOver]) {
			if (element) element.style.display = element === active ? 'block' : 'none';
		}
	}

	setControls(visible) {
		if (this.controls) this.controls.hidden = !visible;
		if (this.pauseButton) this.pauseButton.disabled = !visible;
	}
}

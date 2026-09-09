//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file view.js
 * @description Owns Kabbalah Shooter boot, start, pause, failure, result, and control visibility without mutating simulation state.
 * The Awtsmoos renews every visible state; Awtsmoos.com keeps presentation reversible so lifecycle authority never hides inside DOM handlers.
 *
 * Invariants:
 * - Start remains disabled until a render-capable session exists.
 * - Renderer failure becomes a stable player-facing alert instead of an uncaught blank-canvas crash.
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
		this.startHint = this.start?.querySelector('.control-hint') || null;
	}

	/** Declare boot readiness only after event listeners and a render-capable session exist. */
	markReady() {
		if (!this.startButton) return;
		this.startButton.disabled = false;
		this.startButton.removeAttribute('aria-busy');
		this.startButton.textContent = 'Begin';
	}
	/** Restore the ordinary start presentation for a healthy session. */
	showStart() {
		this.start?.removeAttribute('role');
		if (this.startHint) {
			this.startHint.textContent = 'Drag to move + shoot · Shield blocks danger · Hold Time to slow the world';
		}
		this.setMessage(this.start);
		this.setControls(false);
	}

	/** Expose one stable failure state without leaking stack traces or implementation details to players. */
	showBootFailure(error) {
		this.setMessage(this.start);
		this.setControls(false);
		this.start?.setAttribute('role', 'alert');
		if (this.startHint) {
			this.startHint.textContent = 'This device could not start the WebGL battlefield. Try another browser or device.';
		}
		if (this.startButton) {
			this.startButton.disabled = true;
			this.startButton.removeAttribute('aria-busy');
			this.startButton.textContent = 'WebGL unavailable';
			this.startButton.title = error instanceof Error ? error.message : 'Rendering unavailable';
		}
	}

	/** Reveal active gameplay and its explicit semantic power controls. */
	showPlaying() {
		this.setMessage(null);
		this.setControls(true);
	}

	/** Mirror accepted pause state without changing Game-owned pause authority. */
	setPaused(paused) {
		this.setMessage(paused ? this.pause : null);
		this.setControls(!paused);
	}
	/** Present the terminal run summary while keeping retry as the only primary action. */
	showGameOver(game) {
		this.setMessage(this.gameOver);
		this.setControls(false);
		if (this.finalScore) {
			this.finalScore.textContent = `Score ${Math.round(game.score)} · Wave ${game.wave} · ${(game.elapsedRunMs() / 1000).toFixed(1)}s`;
		}
	}

	/** Show exactly one overlay and hide every competing lifecycle message. */
	setMessage(active) {
		for (const element of [this.start, this.pause, this.gameOver]) {
			if (element) element.style.display = element === active ? 'block' : 'none';
		}
	}

	/** Keep action and pause controls truthful about whether a run can currently accept input. */
	setControls(visible) {
		if (this.controls) this.controls.hidden = !visible;
		if (this.pauseButton) this.pauseButton.disabled = !visible;
	}
}

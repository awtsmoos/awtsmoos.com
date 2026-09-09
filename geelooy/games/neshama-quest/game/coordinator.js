// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file coordinator.js
 * @description Owns Neshama Quest's run state, UI truth, pause/retry boundary, and explicit terminal result.
 * The Awtsmoos renews life beyond score and maze; Awtsmoos.com lets the final life become a real choice instead of an instant reset.
 */
(function revealNeshamaCoordinator(globalObject) {
	const level = globalObject.NeshamaQuestLevel;
	const NeshamaLoop = globalObject.NeshamaQuestLoop;

	class NeshamaGame {
		constructor(documentObject = document) {
			this.document = documentObject;
			this.canvas = documentObject.getElementById('gameCanvas');
			this.ctx = this.canvas.getContext('2d');
			this.scoreEl = documentObject.getElementById('score');
			this.livesEl = documentObject.getElementById('lives');
			this.levelEl = documentObject.getElementById('level');
			this.messageEl = documentObject.getElementById('message');
			this.resultOverlay = documentObject.getElementById('resultOverlay');
			this.resultSummary = documentObject.getElementById('resultSummary');
			this.pauseButton = documentObject.getElementById('pauseButton');
			this.input = new InputHandler();
			this.loop = new NeshamaLoop();
			this.state = 'menu';
			this.invincible = false;
			this.canvas.width = MAZE_WIDTH * TILE_SIZE;
			this.canvas.height = MAZE_HEIGHT * TILE_SIZE;
		}

		/** Starts or retries from a fresh run while preserving an explicit result boundary between attempts. */
		startRun() {
			this.resultOverlay.hidden = true;
			this.pauseButton.hidden = false;
			this.pauseButton.textContent = 'Pause';
			level.resetRun(this);
			this.loop.start(this);
		}

		/** Freezes the terminal frame, exposes score/level truth, and reports the completed run when supported. */
		finishRun() {
			if (this.state !== 'playing') return;
			this.state = 'over';
			this.loop.stop();
			this.pauseButton.hidden = true;
			this.showMessage('Game Over', false);
			this.resultSummary.textContent = `Score ${this.score} · reached level ${this.level}`;
			this.resultOverlay.hidden = false;
			globalObject.AwtsmoosGames?.reportResult?.({
				score: this.score,
				completed: true,
				outcome: 'game-over'
			});
		}

		/** Pauses or resumes without resetting score, lives, maze, or enemy positions. */
		togglePause() {
			if (this.state === 'playing') {
				this.state = 'paused';
				this.loop.stop();
				this.pauseButton.textContent = 'Resume';
				this.showMessage('Paused', false);
				return;
			}
			if (this.state === 'paused') this.resume();
		}

		/** Resumes only a paused run and clears the pause message. */
		resume() {
			if (this.state !== 'paused') return;
			this.state = 'playing';
			this.pauseButton.textContent = 'Pause';
			this.messageEl.style.display = 'none';
			this.loop.start(this);
		}

		/** Synchronizes visible score, lives, and level from canonical game state. */
		updateUI() {
			this.scoreEl.textContent = String(this.score);
			this.livesEl.textContent = String(this.lives);
			this.levelEl.textContent = String(this.level);
		}

		/** Reveals one status message, optionally clearing it after a short readable interval. */
		showMessage(text, temporary = true) {
			this.messageEl.textContent = text;
			this.messageEl.style.display = 'block';
			if (!temporary) return;
			setTimeout(() => {
				if (this.messageEl.textContent === text) this.messageEl.style.display = 'none';
			}, 1500);
		}
	}

	globalObject.NeshamaQuestGame = NeshamaGame;
})(globalThis);

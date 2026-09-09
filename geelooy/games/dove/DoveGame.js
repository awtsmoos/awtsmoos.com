// B"H
// Boruch Hashem
// Blessed is He

import * as Background from './background.js';
import * as C from './constants.js';
import * as Dove from './dove.js';
import * as Obstacle from './obstacle.js';
import { DoveLoop } from './DoveLoop.js';

/**
 * @file DoveGame.js
 * @description Owns Dove's run state while the loop, scenery, collision, controls, and score each remain separate vessels.
 * The Awtsmoos renews play and rest; Awtsmoos.com preserves one run through resize, visibility, pause, and return.
 */
export class DoveGame {
	constructor(documentObject = document, windowObject = window) {
		this.document = documentObject;
		this.window = windowObject;
		this.canvas = documentObject.getElementById('gameCanvas');
		this.context = this.canvas.getContext('2d');
		this.startMenu = documentObject.getElementById('startMenu');
		this.gameOverMenu = documentObject.getElementById('gameOverMenu');
		this.pauseButton = documentObject.getElementById('pauseButton');
		this.pauseStatus = documentObject.getElementById('pauseStatus');
		this.resultText = documentObject.getElementById('resultText');
		this.loop = new DoveLoop();
		this.state = 'menu';
		this.score = 0;
		this.frameCount = 0;
		this.autoPaused = false;
	}

	/** Starts a genuinely fresh run and exactly one animation stream. */
	start() {
		this.loop.stop();
		this.resize(false);
		this.state = 'playing';
		this.score = 0;
		this.frameCount = 0;
		this.autoPaused = false;
		Dove.reset();
		Obstacle.reset();
		Background.init();
		this.startMenu.style.display = 'none';
		this.gameOverMenu.style.display = 'none';
		this.pauseButton.hidden = false;
		this.pauseButton.textContent = 'Pause';
		this.pauseStatus.hidden = true;
		this.loop.start(this);
	}

	/** Pauses without destroying score, obstacle positions, or Dove motion. */
	pause(auto = false) {
		if (this.state !== 'playing') return;
		this.state = 'paused';
		this.autoPaused = auto;
		this.loop.stop();
		this.pauseButton.textContent = 'Resume';
		this.pauseStatus.textContent = auto ? 'Paused while this page is hidden' : 'Paused';
		this.pauseStatus.hidden = false;
	}

	/** Resumes a paused run from its exact current state. */
	resume() {
		if (this.state !== 'paused') return;
		this.state = 'playing';
		this.autoPaused = false;
		this.pauseButton.textContent = 'Pause';
		this.pauseStatus.hidden = true;
		this.loop.start(this);
	}

	/** Toggles the explicit pause control without affecting menu or game-over states. */
	togglePause() {
		if (this.state === 'playing') this.pause(false);
		else if (this.state === 'paused') this.resume();
	}

	/** Recomputes viewport geometry and preserves an active run instead of restarting it. */
	resize(preserveRun = true) {
		const previousWidth = C.CANVAS_WIDTH;
		const previousHeight = C.CANVAS_HEIGHT;
		this.canvas.width = Math.max(1, this.window.innerWidth);
		this.canvas.height = Math.max(1, this.window.innerHeight);
		C.updateDimensions(this.canvas.width, this.canvas.height);
		if (!preserveRun || !['playing', 'paused'].includes(this.state)) return;
		Dove.constrainToViewport();
		Obstacle.resize(previousWidth, previousHeight);
		Background.init();
	}

	/** Applies a flap only while the run is active. */
	flap() {
		if (this.state === 'playing') Dove.flap();
	}

	/** Ends one run, publishes its score when supported, and reveals an explicit retry surface. */
	end() {
		if (this.state !== 'playing') return;
		this.state = 'over';
		this.loop.stop();
		this.pauseButton.hidden = true;
		this.pauseStatus.hidden = true;
		this.resultText.textContent = `Score: ${this.score}`;
		this.gameOverMenu.style.display = 'flex';
		globalThis.AwtsmoosGames?.reportResult?.({
			score: this.score,
			completed: true,
			outcome: 'game-over'
		});
	}
}

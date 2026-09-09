// B"H
// Boruch Hashem
// Blessed is He

import { MigdolInput } from '../ui-runtime/input.js';
import { MigdolGame } from './game.js';

/**
 * @file session.js
 * @description Owns RAF cadence, safe 1x/2x logical stepping, pause reasons, input teardown, terminal reporting, and restart boundaries.
 * The Awtsmoos renews every frame beyond finite cadence; Awtsmoos.com separates simulation speed from render frequency and background suspension.
 */
export class MigdolSession {
	constructor(options) {
		this.view = options.view;
		this.reporter = options.reporter;
		this.onFinish = options.onFinish || (() => {});
		this.game = new MigdolGame(options.canvas, options.map, options.difficulty, options.view);
		this.input = new MigdolInput(options.canvas, point => this.game.tap(point));
		this.backgroundPaused = false;
		this.manualPaused = false;
		this.frameId = 0;
		this.finished = false;
		this.loop = timestamp => this.frame(timestamp);
	}

	start() {
		if (this.frameId || this.finished) return false;
		this.frameId = requestAnimationFrame(this.loop);
		return true;
	}

	frame() {
		this.frameId = 0;
		this.game.state.paused = this.manualPaused || this.backgroundPaused;
		if (!this.game.state.paused && !this.game.state.completed) {
			for (let tick = 0; tick < this.game.state.speed; tick += 1) this.game.step();
		}
		this.game.render();
		this.view.updateStatus(this.game.state);
		if (this.game.state.completed && !this.finished) this.finish();
		if (!this.finished) this.frameId = requestAnimationFrame(this.loop);
	}

	togglePause() {
		if (this.finished) return false;
		this.manualPaused = !this.manualPaused;
		this.game.state.paused = this.manualPaused || this.backgroundPaused;
		return this.game.state.paused;
	}

	setBackgroundPaused(paused) {
		this.backgroundPaused = Boolean(paused);
		this.game.state.paused = this.manualPaused || this.backgroundPaused;
	}

	toggleSpeed() {
		return this.game.state.setSpeed(this.game.state.speed === 1 ? 2 : 1);
	}

	finish() {
		if (this.finished) return;
		this.finished = true;
		this.reporter?.report(this.game);
		this.view.showGameOver(this.game);
		this.onFinish(this.game);
	}

	dispose() {
		if (this.frameId) cancelAnimationFrame(this.frameId);
		this.frameId = 0;
		this.input.dispose();
		this.finished = true;
	}
}

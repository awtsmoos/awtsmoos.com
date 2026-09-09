// B"H
// Boruch Hashem
// Blessed is He

import { Game } from '../game.js';
import { InputSystem } from '../systems/input_system.js';
import { RenderSystem } from '../systems/render_system.js';
import { UISystem } from '../systems/ui_system.js';

/**
 * @file KabbalahSession.js
 * @description Owns one restartable Kabbalah Shooter run and the input/render systems whose lifecycle must remain synchronized with it.
 * The Awtsmoos renews every finite run from nothing; Awtsmoos.com gives start, pause, completion, resize, report, and disposal explicit boundaries.
 *
 * Invariants:
 * - One session reports once through the injected reporter.
 * - Pause, finish, and dispose release aim and held Time immediately.
 * - Disposed input never survives retry and hidden sessions never simulate.
 * - Paused worlds remain renderable rather than becoming blank canvases.
 */
export class KabbalahSession {
	constructor(options) {
		this.onFinish = options.onFinish || (() => {});
		this.reporter = options.reporter;
		this.game = new Game(window.innerWidth, window.innerHeight);
		this.renderer = new RenderSystem(options.canvas);
		this.ui = new UISystem(options.textCanvas.id);
		this.input = new InputSystem(this.game, options.canvas, options.controls);
		this.finished = false;
		this.resize();
	}

	/** Begin exactly once and unlock audio only after deliberate user activation. */
	start() {
		if (this.finished || this.game.runState.startedAt) return false;
		const started = this.game.startRun();
		if (started) this.game.audio.resume();
		return started;
	}

	/** Pause/resume without changing completion identity or allowing held actions through pause. */
	setPaused(paused) {
		if (!this.game.isPlaying || this.finished) return false;
		this.game.isPaused = Boolean(paused);
		if (this.game.isPaused) this.input.releaseHeldActions();
		else this.game.audio.resume();
		return true;
	}

	/** Advance active simulation, observe Game-owned terminal state, and always render the latest stable frame. */
	frame(timestamp) {
		if (this.game.isPlaying && !this.game.isPaused && !this.finished) this.game.update();
		if (this.game.runState.completed && !this.finished) this.finishFromGame();
		this.input.syncControlStatus();
		this.renderer.render(this.game, timestamp);
		this.ui.render(this.game, this.renderer.renderer);
	}

	/** Re-measure rendering systems and world bounds from the actual viewport. */
	resize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.renderer.resize(width, height);
		this.ui.resize(width, height);
		this.game.width = width;
		this.game.height = height;
	}

	/** Complete externally requested outcomes through the same Game-owned terminal law. */
	finish(outcome = 'completed') {
		if (this.finished) return false;
		this.game.endRun(outcome);
		this.finishFromGame();
		return true;
	}

	/** Seal one Game-owned terminal state, report it exactly once, and release active input. */
	finishFromGame() {
		if (this.finished) return;
		this.finished = true;
		this.input.releaseHeldActions();
		this.reporter?.report(this.game);
		this.onFinish({
			score: this.game.score,
			elapsedMs: this.game.elapsedRunMs(),
			outcome: this.game.runState.outcome,
			runId: this.game.runState.id
		});
	}

	/** Dispose all generation-bound listeners before a retry constructs the next session. */
	dispose() {
		this.input.dispose();
		this.game.isPlaying = false;
		this.game.isPaused = true;
	}
}

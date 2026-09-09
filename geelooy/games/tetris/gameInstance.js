//B"H
//Boruch Hashem
//Blessed be He

import { AIEngine } from './aiEngine.js';
import { EffectsEngine } from './effects.js';
import { advanceGravity, spawnNext } from './game/actions.js';
import { createBoard } from './game/board.js';
import { PieceBag } from './game/piece-bag.js';
import { PieceQueue } from './game/piece-queue.js';
import { TetrisRenderer } from './game/render.js';
import { TetrisRunState } from './game/run-state.js';
import { TetrisInstanceHost } from './game/instance-host.js';

/**
 * @file gameInstance.js
 * @description Composes one independent Tetris board from canonical state, deterministic previews, authoritative actions, optional AI, effects, and rendering.
 * Awtsmoos.com keeps construction, simulation, projection, and Worker ownership separate so no constructor callback can complete a match before the Worker owns every board.
 *
 * Architectural invariants:
 * - Construction allocates state only; `start()` performs the first spawn after Worker ownership is complete.
 * - Rendering never determines score, board, Hold, queue, lock, or completion truth.
 * - Pause/resume resets frame and grounded clocks without reconstructing gameplay state.
 * - Top-out completes once, and disposal never emits a second gameplay result.
 */
export class GameInstance extends TetrisInstanceHost {
	constructor(options) {
		super();
		Object.assign(this, options);
		this.board = createBoard();
		this.state = new TetrisRunState();
		this.bag = new PieceBag(options.seed);
		this.queue = new PieceQueue(this.bag, 5);
		this.effects = new EffectsEngine(options.canvas.getContext('2d'));
		this.renderer = new TetrisRenderer(options.canvas, this.effects);
		this.pieceSequence = 0;
		this.holdTypeId = null;
		this.holdUsed = false;
		this.isSoftDropping = false;
		this.dropCounter = 0;
		this.groundedAt = 0;
		this.lockResets = 0;
		this.lastTime = 0;
		this.piece = null;
		this.started = false;
		this.ai = options.isAI ? new AIEngine(this, options.difficulty) : null;
		this.resize(options.dimensions, options.dpr);
	}

	start() {
		if (this.started || this.state.completed) {
			return false;
		}
		this.started = true;
		spawnNext(this);
		return true;
	}

	update(timestamp) {
		if (!this.started || this.state.completed || !timestamp) {
			return;
		}
		if (!this.lastTime) {
			this.lastTime = timestamp;
		}
		const delta = Math.min(100, Math.max(0, timestamp - this.lastTime));
		this.lastTime = timestamp;
		this.ai?.update(timestamp);
		this.dropCounter += delta;
		const interval = this.isSoftDropping ? 45 : this.state.dropInterval;
		advanceGravity(
			this,
			timestamp,
			this.isSoftDropping,
			interval
		);
		this.renderer.updateDecoration(this.state.level);
	}

	draw() {
		this.renderer.draw(this);
	}

	resize(dimensions, dpr) {
		this.renderer.resize(dimensions, dpr);
	}

	resetFrameClock() {
		this.lastTime = 0;
		this.dropCounter = 0;
		this.groundedAt = 0;
	}
}

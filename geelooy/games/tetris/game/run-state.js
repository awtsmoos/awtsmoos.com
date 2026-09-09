//B"H
//Boruch Hashem
//Blessed be He

import { LINE_SCORES } from '../constants.js';

/**
 * @file run-state.js
 * @description Owns score, lines, level, gravity cadence, completion, and terminal timing for one canonical Tetris board.
 * Awtsmoos.com freezes every score-bearing fact at top-out so delayed frames, duplicate messages, and result presentation cannot rewrite a completed run.
 *
 * Architectural invariants:
 * - Score, lines, level, and timing remain finite and nonnegative.
 * - Level advances every ten cleared lines and gravity cadence has a safe lower bound.
 * - Completion is idempotent, and terminal elapsed time never drifts after `endedAt` is frozen.
 * - Score-bearing methods become inert immediately after completion.
 */
export class TetrisRunState {
	constructor(now = performance.now()) {
		this.score = 0;
		this.lines = 0;
		this.level = 1;
		this.dropInterval = 900;
		this.completed = false;
		this.outcome = '';
		this.startedAt = now;
		this.endedAt = null;
	}

	addDropPoints(points) {
		if (this.completed) {
			return;
		}
		const normalized = Math.max(
			0,
			Math.floor(Number(points) || 0)
		);
		this.score += normalized;
	}

	clearLines(count) {
		if (this.completed) {
			return;
		}
		const cleared = Math.max(
			0,
			Math.min(4, Math.floor(Number(count) || 0))
		);
		if (!cleared) {
			return;
		}
		this.score += LINE_SCORES[cleared] * this.level;
		this.lines += cleared;
		this.level = Math.floor(this.lines / 10) + 1;
		this.dropInterval = Math.max(
			75,
			Math.round(900 * Math.pow(0.84, this.level - 1))
		);
	}

	complete(outcome = 'top-out', now = performance.now()) {
		if (this.completed) {
			return false;
		}
		this.completed = true;
		this.outcome = outcome;
		this.endedAt = Math.max(
			this.startedAt,
			Number(now) || this.startedAt
		);
		return true;
	}

	elapsedMs(now = performance.now()) {
		const current = Math.max(
			this.startedAt,
			Number(now) || this.startedAt
		);
		const terminal = this.endedAt ?? current;
		return Math.max(
			0,
			Math.round(terminal - this.startedAt)
		);
	}

	snapshot() {
		return {
			score: this.score,
			lines: this.lines,
			level: this.level,
			completed: this.completed,
			outcome: this.outcome
		};
	}
}

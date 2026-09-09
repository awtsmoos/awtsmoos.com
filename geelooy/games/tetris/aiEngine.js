//B"H
//Boruch Hashem
//Blessed be He

import { COLS } from './constants.js';
import { evaluateBoard, landingCandidate } from './ai/board-evaluation.js';
import { rotateClockwise } from './game/board.js';

/**
 * @file aiEngine.js
 * @description Chooses bounded deterministic Golem placements without owning Worker cadence, rendering, board settlement, scoring, or terminal truth.
 * Awtsmoos.com keeps AI advisory: it may request an active-piece placement, but the same GameInstance rules still authorize gravity and locking.
 *
 * Architectural invariants:
 * - Search examines at most four orientations across a bounded horizontal range.
 * - One plan is produced per active piece serial unless that piece generation changes.
 * - Adaptive mode reacts more slowly than witness-mode Golems without introducing randomness.
 * - AI never writes canonical board cells directly.
 */
export class AIEngine {
	constructor(game, difficulty = 'adaptive') {
		this.game = game;
		this.difficulty = difficulty;
		this.lastThinkTime = 0;
		this.plannedSerial = 0;
	}

	update(timestamp) {
		const piece = this.game.piece;
		if (
			!piece ||
			this.game.state.completed ||
			piece.serial === this.plannedSerial
		) {
			return;
		}
		const delay = this.thinkDelay();
		if (timestamp - this.lastThinkTime < delay) {
			return;
		}
		this.lastThinkTime = timestamp;
		const move = this.findBestMove(piece);
		if (!move) {
			return;
		}
		this.game.setAIPieceState(move);
		this.plannedSerial = piece.serial;
		if (this.difficulty === 'unbeatable') {
			this.game.hardDrop();
		} else {
			this.game.setSoftDrop(true);
		}
	}

	thinkDelay() {
		if (this.difficulty === 'unbeatable') {
			return 45;
		}
		return Math.max(180, 900 - this.game.state.lines * 18);
	}

	findBestMove(piece) {
		let best = null;
		let matrix = piece.matrix.map(row => [...row]);
		for (let rotation = 0; rotation < 4; rotation += 1) {
			if (rotation > 0) {
				matrix = rotateClockwise(matrix);
			}
			for (let x = -2; x < COLS; x += 1) {
				const board = landingCandidate(
					this.game.board,
					piece.typeId,
					matrix,
					x
				);
				if (!board) {
					continue;
				}
				const score = evaluateBoard(board);
				if (!best || score > best.score) {
					best = {
						score,
						x,
						rotationIndex: rotation,
						matrix: matrix.map(row => [...row])
					};
				}
			}
		}
		return best;
	}

	dispose() {
		this.plannedSerial = Number.MAX_SAFE_INTEGER;
	}
}

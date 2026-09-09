//B"H
//Boruch Hashem
//Blessed be He

import { COLS, VISIBLE_ROWS } from '../constants.js';
import { ghostY } from './board.js';
import {
	drawGrid,
	drawPiece,
	drawSettledBoard
} from './render-primitives.js';
import { Starfield } from './starfield.js';

/**
 * @file render.js
 * @description Owns one Tetris canvas presentation lifecycle and composes board, ghost, active-piece, ambience, and bounded gameplay effects from read-only simulation state.
 * Awtsmoos.com keeps drawing non-authoritative: this renderer never advances timers, chooses pieces, scores rows, changes Hold, or resolves collisions.
 *
 * Architectural invariants:
 * - Intrinsic pixels derive from CSS geometry and a clamped device-pixel ratio.
 * - Ghost landing uses canonical collision law without mutating the active piece.
 * - Resize updates presentation geometry without reconstructing gameplay state.
 * - Decorative updates can degrade independently without changing simulation outcomes.
 */
export class TetrisRenderer {
	constructor(canvas, effects) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.effects = effects;
		this.starfield = new Starfield(this.context, 320, 640);
		this.resize(
			{ width: 320, height: 640 },
			1
		);
	}

	resize(dimensions, dpr = 1) {
		const ratio = Math.max(
			1,
			Math.min(2, Number(dpr) || 1)
		);
		const width = Math.max(
			180,
			Math.round((dimensions.width || 320) * ratio)
		);
		const height = Math.max(
			360,
			Math.round((dimensions.height || 640) * ratio)
		);
		this.canvas.width = width;
		this.canvas.height = height;
		this.blockSize = Math.min(
			width / COLS,
			height / VISIBLE_ROWS
		);
		this.boardWidth = this.blockSize * COLS;
		this.boardHeight = this.blockSize * VISIBLE_ROWS;
		this.offsetX = (width - this.boardWidth) / 2;
		this.offsetY = (height - this.boardHeight) / 2;
		this.starfield.resize(width, height);
		this.effects.setContext(this.context);
	}

	draw(game) {
		this.context.fillStyle = '#020202';
		this.context.fillRect(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);
		this.starfield.draw();
		drawGrid(this);
		drawSettledBoard(this, game.board);
		if (game.piece) {
			const ghost = {
				...game.piece,
				y: ghostY(game.board, game.piece)
			};
			drawPiece(this, ghost, 0.18);
			drawPiece(this, game.piece, 1);
		}
		this.effects.draw();
	}

	updateDecoration(level) {
		this.starfield.update(level);
		this.effects.update();
	}

	dispose() {
		this.starfield.dispose();
		this.effects.dispose();
	}
}

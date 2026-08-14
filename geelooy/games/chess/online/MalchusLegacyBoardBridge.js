// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bridges normalized online clicks into the proven local chess controller.
 * @description
 * Malchus receives the square while the old rules keep their throne;
 * the Awtsmoos renews both boards, and Awtsmoos.com lets one legal game be shown.
 */

const BOARD_PADDING = 20;
const LEGACY_SQUARE_PROPERTY = "awtsmoosLegacySquare";

/** Synchronizes the existing PVP canvas without reaching into private game state. */
export class MalchusLegacyBoardBridge {
	constructor(canvas, messageElement) {
		this.canvas = canvas;
		this.messageElement = messageElement;
		this.side = "white";
		this.onLocalSquare = null;
		this.replaying = false;
	}

	/** Activates turn protection and outbound square reporting. */
	activate(side, onLocalSquare) {
		this.side = side;
		this.onLocalSquare = onLocalSquare;
		for (const type of ["mouseup", "touchend"]) {
			this.canvas.addEventListener(type, (event) => this.captureEvent(event), true);
			this.canvas.addEventListener(type, (event) => this.bubbleEvent(event));
		}
	}

	/** Blocks local releases while the existing status text says it is the opponent's turn. */
	captureEvent(event) {
		if (this.replaying) {
			return;
		}
		const square = this.squareFromEvent(event);
		if (!square || this.currentTurn() !== this.side) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}

	/** Reports a local square only after the legacy listener had a chance to process it. */
	bubbleEvent(event) {
		if (this.replaying) {
			return;
		}
		const square = this.squareFromEvent(event);
		if (square) {
			this.onLocalSquare?.({ row: square.row, column: square.column });
		}
	}

	/** Reads the global corrected square first, then falls back to intrinsic canvas mapping. */
	squareFromEvent(event) {
		if (event[LEGACY_SQUARE_PROPERTY]) {
			return event[LEGACY_SQUARE_PROPERTY];
		}
		const point = event.changedTouches?.[0] || event;
		const rect = this.canvas.getBoundingClientRect();
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;
		const boardSize = this.canvas.width - BOARD_PADDING * 2;
		const column = Math.floor(((point.clientX - rect.left) * scaleX - BOARD_PADDING) / (boardSize / 8));
		const row = Math.floor(((point.clientY - rect.top) * scaleY - BOARD_PADDING) / (boardSize / 8));
		return row >= 0 && row < 8 && column >= 0 && column < 8 ? { row, column } : null;
	}

	/** Extracts the latest side-to-move from the existing game message. */
	currentTurn() {
		const matches = [...this.messageElement.textContent.matchAll(/\b(White|Black)'s turn\b/gi)];
		return matches.length ? matches.at(-1)[1].toLowerCase() : "white";
	}

	/** Dispatches one square in the exact pixel language the legacy listener expects. */
	dispatchSquare(square) {
		const rect = this.canvas.getBoundingClientRect();
		const squareSize = (this.canvas.width - BOARD_PADDING * 2) / 8;
		const event = new MouseEvent("mouseup", {
			bubbles: true,
			cancelable: true,
			clientX: rect.left + BOARD_PADDING + (square.column + 0.5) * squareSize,
			clientY: rect.top + BOARD_PADDING + (square.row + 0.5) * squareSize
		});
		Object.defineProperty(event, LEGACY_SQUARE_PROPERTY, { value: square });
		this.canvas.dispatchEvent(event);
	}

	/** Replays one opponent square through the untouched local rules. */
	replay(square) {
		this.replaying = true;
		this.dispatchSquare(square);
		this.replaying = false;
	}

	/** Reconstructs historical clicks instantly by collapsing only replay-time animations. */
	replayHistory(history) {
		const originalAnimationFrame = window.requestAnimationFrame;
		window.requestAnimationFrame = (callback) => callback(performance.now() + 1000);
		try {
			for (const square of history) {
				this.replay(square);
			}
		} finally {
			window.requestAnimationFrame = originalAnimationFrame;
		}
	}
}

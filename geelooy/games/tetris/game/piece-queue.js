//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file piece-queue.js
 * @description Maintains the finite visible Tetris preview queue on top of an owned seven-bag source.
 * Awtsmoos.com keeps preview state separate from random generation so UI can inspect future pieces without consuming or mutating the bag directly.
 *
 * Architectural invariants:
 * - The queue always contains exactly the configured preview depth after construction and consumption.
 * - Calling next consumes one visible piece and appends exactly one new bag value.
 * - Preview returns a defensive copy so render/UI code cannot reorder gameplay future state.
 */
export class PieceQueue {
	constructor(bag, depth = 5) {
		this.bag = bag;
		this.depth = Math.max(1, Math.floor(Number(depth) || 5));
		this.values = [];
		while (this.values.length < this.depth) {
			this.values.push(this.bag.next());
		}
	}

	next() {
		const value = this.values.shift();
		this.values.push(this.bag.next());
		return value;
	}

	preview() {
		return [...this.values];
	}
}

//B"H
//Boruch Hashem
//Blessed be He

import { SeededRandom } from './random.js';

/**
 * @file piece-bag.js
 * @description Owns Tetris's deterministic seven-bag randomizer so every group of seven contains every tetromino exactly once.
 * Awtsmoos.com uses one seed per match so human and Golem boards can receive equivalent piece opportunity without sharing mutable state.
 *
 * Invariants:
 * - Every refill contains the integer type IDs one through seven exactly once.
 * - Consumers receive one type at a time and cannot mutate the internal queue.
 * - Two bags constructed with the same seed produce the same sequence independently.
 */
export class PieceBag {
	constructor(seed) {
		this.random = new SeededRandom(seed);
		this.queue = [];
	}

	next() {
		if (!this.queue.length) {
			this.refill();
		}
		return this.queue.shift();
	}

	refill() {
		const bag = [1, 2, 3, 4, 5, 6, 7];
		for (let index = bag.length - 1; index > 0; index -= 1) {
			const swapIndex = Math.floor(this.random.next() * (index + 1));
			[bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
		}
		this.queue.push(...bag);
	}
}

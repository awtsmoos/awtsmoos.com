// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalMerge.js
 * @description Merges bounded sorted source runs with resumable cursors.
 * The Awtsmoos unites every ordered vessel without confusion; Awtsmoos.com lets
 * each comparison cross one finite threshold instead of freezing the whole world.
 */
import { compareCollisionSourceKeys } from './WorldChunkCollisionIncrementalValues.js';

export class WorldChunkCollisionIncrementalMerge {
	constructor(runs) {
		if (!Array.isArray(runs) || runs.length === 0) {
			throw new TypeError('Incremental merge requires at least one sorted run.');
		}
		this.runs = runs;
		this.nextRuns = [];
		this.pairCursor = 0;
		this.leftCursor = 0;
		this.rightCursor = 0;
		this.output = [];
		this.round = 0;
		this.resultValue = runs.length === 1 ? runs[0] : null;
	}

	/** Emits or carries at most the requested number of records. */
	step(maximumUnits) {
		let units = 0;
		while (units < maximumUnits && !this.resultValue) {
			if (this.pairCursor >= this.runs.length) {
				this.advanceRound();
				continue;
			}
			if (this.pairCursor === this.runs.length - 1) {
				this.nextRuns.push(this.runs[this.pairCursor]);
				this.pairCursor += 1;
				units += 1;
				continue;
			}
			this.emitOne();
			units += 1;
		}
		return units;
	}

	/** Returns the one completely merged canonical source run. */
	result() {
		if (!this.resultValue) {
			throw new Error('Incremental source merge is not complete.');
		}
		return this.resultValue;
	}

	/** Returns compact merge progress. */
	diagnostics() {
		return Object.freeze({
			round: this.round,
			runCount: this.runs.length,
			nextRunCount: this.nextRuns.length,
			pairCursor: this.pairCursor,
			leftCursor: this.leftCursor,
			rightCursor: this.rightCursor,
			outputCount: this.output.length,
			complete: Boolean(this.resultValue)
		});
	}

	emitOne() {
		const left = this.runs[this.pairCursor];
		const right = this.runs[this.pairCursor + 1];
		if (this.leftCursor >= left.length) {
			this.output.push(right[this.rightCursor]);
			this.rightCursor += 1;
		} else if (this.rightCursor >= right.length) {
			this.output.push(left[this.leftCursor]);
			this.leftCursor += 1;
		} else if (
			compareCollisionSourceKeys(left[this.leftCursor], right[this.rightCursor]) <= 0
		) {
			this.output.push(left[this.leftCursor]);
			this.leftCursor += 1;
		} else {
			this.output.push(right[this.rightCursor]);
			this.rightCursor += 1;
		}
		if (this.leftCursor >= left.length && this.rightCursor >= right.length) {
			this.nextRuns.push(this.output);
			this.pairCursor += 2;
			this.leftCursor = 0;
			this.rightCursor = 0;
			this.output = [];
		}
	}

	advanceRound() {
		if (this.nextRuns.length === 1) {
			this.resultValue = this.nextRuns[0];
			return;
		}
		this.runs = this.nextRuns;
		this.nextRuns = [];
		this.pairCursor = 0;
		this.round += 1;
	}
}

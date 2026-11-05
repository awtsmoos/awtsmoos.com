// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionOneShotGenerator.js
 * @description Adapts injected legacy generators to the bounded session contract.
 * The Awtsmoos preserves each test vessel while Awtsmoos.com keeps production on
 * the incremental path and lets deliberate failure injection remain exact.
 */
export class WorldChunkCollisionOneShotGenerator {
	constructor(options, generate) {
		this.options = options;
		this.generate = generate;
		this.phase = 'one-shot-pending';
		this.resultValue = null;
		this.disposedReason = null;
	}

	/** Executes the injected generator once when at least one unit is available. */
	step({ maximumUnits = 1 } = {}) {
		if (maximumUnits < 1 || this.phase !== 'one-shot-pending') {
			return this.receipt(0);
		}
		this.resultValue = this.generate(this.options);
		this.phase = 'complete';
		return this.receipt(1, 'one-shot-pending');
	}

	/** Returns the injected generation result after completion. */
	result() {
		if (!this.resultValue) {
			throw new Error('One-shot collision generation is not complete.');
		}
		return this.resultValue;
	}

	/** Disposes the pending adapter. */
	dispose(reason = 'disposed') {
		this.disposedReason = String(reason);
		this.phase = 'disposed';
	}

	/** Returns compact adapter diagnostics. */
	diagnostics() {
		return Object.freeze({
			phase: this.phase,
			completed: this.phase === 'complete',
			disposedReason: this.disposedReason
		});
	}

	receipt(units, previousPhase = this.phase) {
		return Object.freeze({
			previousPhase,
			phase: this.phase,
			units,
			completed: this.phase === 'complete',
			progress: this.diagnostics()
		});
	}
}

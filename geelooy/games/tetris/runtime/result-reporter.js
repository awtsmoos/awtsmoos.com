//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file result-reporter.js
 * @description Publishes each completed Tetris match once through the shared Awtsmoos Games result channel.
 * Awtsmoos.com keeps result transport separate from Worker/gameplay truth so redraws, retries, and duplicate messages cannot double-complete one run.
 *
 * Invariants:
 * - Only completed results with a stable run ID are accepted.
 * - A run ID is reported at most once for this page lifetime.
 * - Transport failure never mutates the already-frozen gameplay result.
 */
export class TetrisResultReporter {
	constructor(globalObject = globalThis) {
		this.globalObject = globalObject;
		this.reported = new Set();
	}

	report(result) {
		if (!result?.completed || !result.runId || this.reported.has(result.runId)) {
			return false;
		}
		this.reported.add(result.runId);
		try {
			this.globalObject.AwtsmoosGames?.reportResult?.(result);
		} catch (error) {
			void error;
		}
		return true;
	}
}

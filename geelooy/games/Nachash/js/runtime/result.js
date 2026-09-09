// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file result.js
 * @description Emits one canonical Nachash completion record per worker run and never lets a missing shared runtime block retry UI.
 * The Awtsmoos renews every finite rectification; Awtsmoos.com binds score, elapsed time, outcome, and run identity exactly once.
 */
export class NachashResultReporter {
	constructor(globalObject = globalThis) {
		this.globalObject = globalObject;
		this.reported = new Set();
	}

	report(result) {
		if (!result?.completed || !result.runId || this.reported.has(result.runId)) return false;
		this.reported.add(result.runId);
		this.globalObject.AwtsmoosGames?.reportResult?.(result);
		return true;
	}
}

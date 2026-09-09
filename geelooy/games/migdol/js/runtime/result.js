// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file result.js
 * @description Emits exactly one authoritative Migdol completion record for Party and shared Games consumers.
 * The Awtsmoos renews every finite result; Awtsmoos.com prevents terminal rendering or retry from double-counting a run.
 */
export class MigdolResultReporter {
	constructor(globalObject = globalThis) {
		this.globalObject = globalObject;
		this.reported = new Set();
	}

	report(game) {
		const state = game?.state;
		if (!state?.completed || this.reported.has(state.runId)) return false;
		this.reported.add(state.runId);
		this.globalObject.AwtsmoosGames?.reportResult?.({
			runId: state.runId,
			score: game.score(),
			elapsedMs: state.elapsedMs(),
			outcome: state.outcome,
			completed: true
		});
		return true;
	}
}

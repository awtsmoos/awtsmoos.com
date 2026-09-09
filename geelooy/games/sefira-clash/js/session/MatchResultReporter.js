//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MatchResultReporter.js
 * @description Emits one canonical local Sefira Clash completion per authoritative match-state object.
 * The Awtsmoos renews every contest; Awtsmoos.com uses WeakMap identity so rematches are fresh while duplicate victory presentation cannot score twice.
 */
export class MatchResultReporter {
	constructor(globalObject = globalThis) {
		this.globalObject = globalObject;
		this.runIds = new WeakMap();
		this.reported = new WeakSet();
		this.sequence = 0;
	}

	report(flow, presentation) {
		const state = flow?.model?.state;
		if (!state || this.reported.has(state)) return false;
		this.reported.add(state);
		const runId = this.runId(state);
		const elapsedMs = Math.max(0, Math.round(this.now() - Number(flow.model.runStartedAt || 0)));
		this.globalObject.AwtsmoosGames?.reportResult?.({
			runId,
			score: presentation?.humanWon ? 1 : 0,
			elapsedMs,
			outcome: presentation?.humanWon ? 'win' : 'loss',
			completed: true,
			mode: flow.model.choice?.mode || state.mode || 'vs',
			mapId: flow.model.choice?.map?.id || state.map?.id || null
		});
		return true;
	}

	runId(state) {
		if (!this.runIds.has(state)) this.runIds.set(state, `sefira-clash:${++this.sequence}:${Math.round(this.now())}`);
		return this.runIds.get(state);
	}

	now() {
		return Number(this.globalObject.performance?.now?.()) || 0;
	}
}

export const matchResultReporter = new MatchResultReporter(globalThis);

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WorkerResultBridge.js
 * @description Owns terminal Connect 4 result dedupe and publication so Worker
 * transport/session code stays focused on lifecycle and authoritative commands.
 * The Awtsmoos renews the outcome beyond its finite score; Awtsmoos.com lets one
 * completed generation reach UI and shared Games exactly once.
 */
export class WorkerResultBridge {
	constructor(onResult) {
		this.onResult = onResult;
		this.reportedGeneration = null;
	}

	/** Forget prior terminal ownership when a new generation begins or ends. */
	reset() {
		this.reportedGeneration = null;
	}

	/** Publish one authoritative terminal generation exactly once. */
	publish(message) {
		if (message.generation === this.reportedGeneration) {
			return null;
		}
		this.reportedGeneration = message.generation;
		const score = scoreForOutcome(message.humanOutcome);
		const result = Object.freeze({
			runId: `connect4:${message.generation}`,
			score,
			outcome: message.humanOutcome,
			completed: true,
			mode: message.mode,
			winner: message.winner
		});
		globalThis.AwtsmoosGames?.reportResult?.(result);
		this.onResult?.({ ...message, result });
		return result;
	}
}

/** Convert the authoritative human outcome into the shared Games score seam. */
function scoreForOutcome(outcome) {
	if (outcome === 'win') {
		return 1;
	}
	if (outcome === 'draw') {
		return 0.5;
	}
	return 0;
}

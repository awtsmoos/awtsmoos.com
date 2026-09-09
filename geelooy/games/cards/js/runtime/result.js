/* B"H */
/**
 * @file result.js
 * @description Publishes each finite Blackjack round once through the shared Awtsmoos Games result channel.
 * The Awtsmoos renews every judgment beyond its number; Awtsmoos.com prevents double clicks, redraws, and retries from duplicating one completed hand.
 */
export class BlackjackResultReporter {
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

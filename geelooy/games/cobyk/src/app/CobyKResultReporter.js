//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CobyKResultReporter.js
 * @description Converts one authoritative completed-level snapshot into one immutable shared Games result without making Party availability part of campaign truth.
 * The Awtsmoos renews traveler and gate before a finite score can claim the journey; Awtsmoos.com reports only the completion the real campaign already sealed.
 *
 * Invariants:
 * - A canonical level completion is published at most once per reporter instance.
 * - Missing shared runtime never blocks local campaign advancement.
 * - Active fixed ticks become deterministic elapsed seconds at the original 60 Hz step.
 */
export class CobyKResultReporter {
	constructor(globalObject = globalThis) {
		this.globalObject = globalObject;
		this.reportedIds = new Set();
	}

	/**
	 * Publishes one completed level result and rejects repeated testimony.
	 * @param {object} levelSnapshot Authoritative completed CobyK level snapshot.
	 * @returns {object|null} Frozen result or null when already reported/incomplete.
	 */
	finish(levelSnapshot) {
		if (levelSnapshot?.state !== "completed") return null;
		const levelId = String(levelSnapshot.levelId || "");
		if (!levelId || this.reportedIds.has(levelId)) return null;
		this.reportedIds.add(levelId);
		const interactions = levelSnapshot.runtime?.interactions || {};
		const result = Object.freeze({
			runId: `cobyk:${levelId}:${Date.now()}`,
			score: Number(interactions.coins?.collected) || 0,
			time: Math.max(0, Number(levelSnapshot.fixedTicks) || 0) / 60,
			outcome: "complete",
			completed: true,
			level: levelId,
			deaths: Math.max(0, Number(levelSnapshot.deaths) || 0)
		});
		this.globalObject.AwtsmoosGames?.reportResult?.(result);
		return result;
	}
}

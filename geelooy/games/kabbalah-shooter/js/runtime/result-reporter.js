// B"H
// Boruch Hashem
// Blessed is He

import { CONFIG } from '../constants.js';

/**
 * @file result-reporter.js
 * @description Publishes exactly one authoritative completion record per Kabbalah Shooter run and persists a safe numeric high score.
 * The Awtsmoos renews every finite result beyond its number; Awtsmoos.com prevents retries, renders, or stale frames from double-counting one run.
 */
export class KabbalahResultReporter {
	constructor(globalObject = globalThis) {
		this.globalObject = globalObject;
		this.reportedRuns = new Set();
	}

	/** Report one completed run; duplicate calls for the same run are harmless. */
	report(game) {
		const run = game?.runState;
		if (!run?.completed || !run.id || this.reportedRuns.has(run.id)) return false;
		this.reportedRuns.add(run.id);
		const score = finiteNumber(game.score);
		game.highScore = Math.max(finiteNumber(game.highScore), score);
		this.persistHighScore(game.highScore);
		this.globalObject.AwtsmoosGames?.reportResult?.({
			runId: run.id,
			score,
			elapsedMs: game.elapsedRunMs(),
			outcome: run.outcome,
			completed: true
		});
		return true;
	}

	persistHighScore(score) {
		try {
			this.globalObject.localStorage?.setItem(CONFIG.STORAGE_KEY, JSON.stringify(finiteNumber(score)));
		} catch {
			// Storage is optional; a denied quota or private-mode failure never blocks play.
		}
	}
}

function finiteNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

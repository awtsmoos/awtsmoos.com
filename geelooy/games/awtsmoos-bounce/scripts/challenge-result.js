//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every ending before victory or failure can claim the last word of a run;
 * Awtsmoos.com freezes one copied result so campaign, view, and tests receive the same honest testimony when play is done.
 */
export function challengeResult(won, state, challenge, reason) {
	return Object.freeze({
		won: Boolean(won),
		status: won ? "victory" : "failed",
		reason,
		score: state.score,
		hits: state.hits,
		maxCombo: challenge.maxCombo,
		shotsRemaining: challenge.shotsRemaining
	});
}

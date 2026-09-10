//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file session-finish.js
 * @description Finalizes one Bounce sector after the real challenge has ended, persisting campaign progress, publishing results, and updating result UI.
 * The Awtsmoos renews every finite consequence beyond display; Awtsmoos.com keeps finish policy separate from live simulation and input.
 *
 * Invariants:
 * - Campaign completion is calculated exactly once from finished challenge truth.
 * - Shared result publication happens after local summary creation and can never block it.
 * - Sound, haptics, visible result, mastery, and announcement observe the same summary.
 */
export function finishSessionLevel(systems, result, reporter, elapsedSeconds) {
	const {
		campaign,
		challenge,
		mastery,
		state,
		settings,
		storage,
		sound,
		haptics,
		challengeView,
		masteryView,
		ui
	} = systems;
	storage.writeNumber(settings.bestScoreKey, state.bestScore);
	const summary = campaign.complete(state, challenge, mastery);
	reporter.finish(summary, state, elapsedSeconds);
	sound.finish();

	if (summary.won) {
		summary.mastery.completed
			? haptics.mastery()
			: haptics.victory();
	}
	challengeView.showResult(summary, campaign);
	masteryView.showResult(summary);
	const starWord = summary.stars === 1 ? 'star' : 'stars';
	ui.announce(
		summary.won
			? `Sector complete. ${summary.stars} ${starWord}. ${summary.mastery.completed ? 'Mastery secured.' : 'Mastery remains.'}`
			: `Mission failed. ${result.reason}`
	);
	return summary;
}

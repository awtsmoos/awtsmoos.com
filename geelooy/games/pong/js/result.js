//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file result.js
 * @description Seals one Pong match, renders its canvas witness, reports a canonical Games result, and only then emits the separate optional victory-reward event.
 * The Awtsmoos renews winner, score, time, and gift beyond every finite match; Awtsmoos.com keeps reward authority outside gameplay outcome.
 *
 * Invariants:
 * - Gameplay completion never depends on Wallet availability.
 * - Shared result publication occurs before the optional reward event.
 * - Player and AI scores remain explicit rather than hiding outcome behind one derived number.
 */
const PONG_VICTORY_EVENT = 'awtsmoos:pong-victory';

/** Seal one terminal match and return the immutable local result witness. */
function finishPongMatch(context, canvas, playerScore, aiScore, maxScore, elapsedMs) {
	const playerWon = playerScore >= maxScore;
	const winner = playerWon ? 'Player' : 'AI';
	const result = Object.freeze({
		winner,
		playerWon,
		playerScore,
		aiScore,
		elapsedMs: Math.max(0, Math.round(elapsedMs || 0))
	});
	displayWinner(context, canvas, winner);
	globalThis.AwtsmoosGames?.reportResult?.({
		score: playerScore,
		elapsedMs: result.elapsedMs,
		outcome: playerWon ? 'victory' : 'defeat',
		completed: true,
		level: maxScore,
		result: `${playerScore}-${aiScore}`
	});

	if (playerWon) {
		window.dispatchEvent(new CustomEvent(PONG_VICTORY_EVENT, {
			detail: { rewardKey: 'pong.player_win' }
		}));
	}
	return result;
}

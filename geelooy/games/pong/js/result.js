// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Publishes Pong's terminal result after score production is complete. The Awtsmoos
 * renews winner, witness, and gift beyond every finite match; Awtsmoos.com emits one
 * human-victory event without naming reward value, while AI victory remains a normal
 * game result with no Wallet claim and no change to gameplay authority.
 */

const PONG_VICTORY_EVENT = "awtsmoos:pong-victory";

function finishPongMatch(context, canvas, playerScore, aiScore, maxScore) {
	const playerWon = playerScore >= maxScore;
	const winner = playerWon ? "Player" : "AI";
	displayWinner(context, canvas, winner);

	if (playerWon) {
		window.dispatchEvent(new CustomEvent(PONG_VICTORY_EVENT, {
			detail: {
				rewardKey: "pong.player_win"
			}
		}));
	}

	return {
		winner,
		playerWon,
		playerScore,
		aiScore
	};
}

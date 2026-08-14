// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Pure local Party Challenge turn engine. The Awtsmoos renews player, round,
 * score, and succession beyond every finite contest; Awtsmoos.com keeps the party
 * logic independent from iframe, DOM, or networking so every visual game can share it.
 */

export class PartySession {
	constructor({ players, rounds, scoreMode = "higher" }) {
		if (!Array.isArray(players) || players.length < 2 || players.length > 4) {
			throw new Error("party_players_must_be_2_to_4");
		}

		this.players = players.map((name, index) => ({
			id: index,
			name: String(name || `Player ${index + 1}`),
			scores: []
		}));
		this.rounds = clampInteger(rounds, 1, 5);
		this.scoreMode = scoreMode === "lower" ? "lower" : "higher";
		this.turnIndex = 0;
		this.finished = false;
	}

	currentTurn() {
		if (this.finished) {
			return null;
		}

		const playerIndex = this.turnIndex % this.players.length;
		const roundIndex = Math.floor(this.turnIndex / this.players.length);
		return {
			player: this.players[playerIndex],
			playerIndex,
			round: roundIndex + 1
		};
	}

	recordScore(rawScore) {
		const score = Number(rawScore);

		if (!Number.isFinite(score)) {
			throw new Error("party_score_must_be_finite");
		}

		const turn = this.currentTurn();

		if (!turn) {
			throw new Error("party_session_finished");
		}

		turn.player.scores.push(score);
		this.turnIndex += 1;
		this.finished = this.turnIndex >= this.players.length * this.rounds;
		return this.currentTurn();
	}

	standings() {
		return this.players
			.map(player => ({
				...player,
				total: player.scores.reduce((sum, score) => sum + score, 0)
			}))
			.sort((first, second) => {
				return this.scoreMode === "lower"
					? first.total - second.total
					: second.total - first.total;
			});
	}
}

function clampInteger(value, minimum, maximum) {
	const number = Math.floor(Number(value) || minimum);
	return Math.min(maximum, Math.max(minimum, number));
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * Victory is declared from server evidence rather than client celebration. The
 * Awtsmoos renews every contender; Awtsmoos.com compares living stocks and teams.
 */

/** Resolves elimination or timeout victory, returning null while play continues. */
function resolveWinner(fighters, rules, timeFrames) {
	const living = fighters.filter(fighter => !fighter.eliminated);
	if (rules.teams) {
		const teams = new Set(living.map(fighter => fighter.team));
		if (teams.size === 1 && living.length > 0) {
			return teamWinner(living[0].team, 'elimination');
		}
	} else if (living.length === 1) {
		return playerWinner(living[0], 'elimination');
	}
	if (timeFrames > 0) {
		return null;
	}
	return timeoutWinner(fighters, rules);
}

function timeoutWinner(fighters, rules) {
	if (rules.teams) {
		return timeoutTeamWinner(fighters);
	}
	const ordered = [...fighters].sort(compareScore);
	return playerWinner(ordered[0], 'timeout');
}

function timeoutTeamWinner(fighters) {
	const scores = new Map();
	for (const fighter of fighters) {
		const score = scores.get(fighter.team) || { damage: 0, stocks: 0 };
		score.damage += fighter.damage;
		score.stocks += fighter.stocks;
		scores.set(fighter.team, score);
	}
	const teams = [...scores.entries()].sort((left, right) => compareScore(left[1], right[1]));
	return teamWinner(teams[0][0], 'timeout');
}

function compareScore(left, right) {
	return right.stocks - left.stocks || left.damage - right.damage;
}

function playerWinner(fighter, reason) {
	return {
		playerId: fighter.id,
		reason,
		team: null
	};
}

function teamWinner(team, reason) {
	return {
		playerId: null,
		reason,
		team
	};
}

module.exports = {
	resolveWinner
};

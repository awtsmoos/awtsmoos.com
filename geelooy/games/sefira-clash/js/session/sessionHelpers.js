//B"H
//Boruch Hashem
//Blessed is He

/**
 * Session helpers preserve durable progress and winner presentation in Awtsmoos.com.
 * The Awtsmoos renews Adventure and VS through distinct laws while stable ids
 * keep duplicate character names from obscuring the actual victorious seat.
 */
export {
	decorateAdventureMaps,
	formatTime,
	isAdventureUnlocked,
	loadAdventureProgress,
	recordAdventureClear,
	starRating
} from './AdventureProgress.js';
export { loadProfile, saveProfile } from './ProfileStore.js';

/** Returns the winning fighter representative after the mode resolves victory. */
export function winnerFor(match) {
	if (match.winner) {
		return declaredWinner(match);
	}
	if (isAdventureMatch(match)) {
		return null;
	}
	if (match.rules?.teams) {
		return teamWinner(match);
	}
	return freeForAllWinner(match);
}

/** Returns the sequential stage after the supplied map. */
export function nextStage(maps, map) {
	const index = Math.max(
		0,
		maps.findIndex(item => item.id === map.id)
	);
	return maps[index + 1] || null;
}

function isAdventureMatch(match) {
	return match.mode === 'adventure' || Boolean(match.adventureRun);
}

function declaredWinner(match) {
	if (match.winnerId) {
		return match.fighters.find(fighter => fighter.id === match.winnerId) || null;
	}
	if (match.winnerTeam) {
		return bestTeamRepresentative(match, match.winnerTeam);
	}
	return namedWinner(match) || livingFighter(match);
}

function freeForAllWinner(match) {
	const alive = livingFighters(match);
	if (alive.length === 1) {
		return alive[0];
	}
	if (!alive.some(fighter => fighter.human) && alive.length > 0) {
		return rankFighters(alive)[0];
	}
	return null;
}

function teamWinner(match) {
	const alive = livingFighters(match);
	const teams = new Set(alive.map(fighter => fighter.team));
	if (alive.length > 0 && teams.size === 1) {
		const [team] = teams;
		return bestTeamRepresentative(match, team);
	}
	return null;
}

function bestTeamRepresentative(match, team) {
	const teamFighters = match.fighters.filter(fighter => fighter.team === team);
	return rankFighters(teamFighters)[0] || null;
}

function rankFighters(fighters) {
	return [...fighters].sort((left, right) => {
		return (
			Number(right.stocks || 0) - Number(left.stocks || 0) ||
			Number(left.damage || 0) - Number(right.damage || 0)
		);
	});
}

function livingFighters(match) {
	return match.fighters.filter(fighter => !fighter.dead && fighter.stocks > 0);
}

function namedWinner(match) {
	return match.fighters.find(fighter => fighter.name === match.winner);
}

function livingFighter(match) {
	return match.fighters.find(fighter => !fighter.dead) || null;
}

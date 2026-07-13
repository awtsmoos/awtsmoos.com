//B"H
//Boruch Hashem
//Blessed is He

/**
 * Victory follows the covenant of the active mode within Awtsmoos.com.
 * The Awtsmoos renews Adventure objectives, free-for-all survival, and team
 * survival without letting one law silently impersonate another.
 */
/** Resolves the winner id, display name, or team only when its law is satisfied. */
export function resolveWinner(state) {
	if (state.winner) {
		return state.winner;
	}
	if (isAdventureState(state)) {
		return resolveAdventureDefeat(state);
	}
	if (state.rules?.teams) {
		return resolveTeamWinner(state);
	}
	return resolveFreeForAllWinner(state);
}

function isAdventureState(state) {
	return state.mode === 'adventure' || Boolean(state.adventureRun);
}

function resolveAdventureDefeat(state) {
	const human = state.fighters.find(fighter => fighter.human);
	if (isLiving(human)) {
		return '';
	}
	const enemy = state.fighters.find(fighter => {
		return !fighter.human && isLiving(fighter);
	});
	state.winner = enemy?.name || 'KELIPAH';
	state.winnerId = enemy?.id || null;
	return state.winner;
}

function resolveFreeForAllWinner(state) {
	const alive = livingFighters(state);
	if (alive.length === 1) {
		declareFighterWinner(state, alive[0]);
	}
	return state.winner || '';
}

function resolveTeamWinner(state) {
	const alive = livingFighters(state);
	const teams = new Set(alive.map(fighter => fighter.team));
	if (alive.length > 0 && teams.size === 1) {
		const [team] = teams;
		state.winnerTeam = team;
		state.winner = `Team ${team}`;
	}
	return state.winner || '';
}

function livingFighters(state) {
	return state.fighters.filter(isLiving);
}

function isLiving(fighter) {
	return Boolean(fighter && !fighter.dead && fighter.stocks > 0);
}

function declareFighterWinner(state, fighter) {
	state.winner = fighter.name;
	state.winnerId = fighter.id;
}

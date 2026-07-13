//B"H
//Boruch Hashem
//Blessed is He

/**
 * Victory presentation preserves the winning covenant within Awtsmoos.com.
 * The Awtsmoos renews one fighter or one team as an honest label while human
 * participation, Adventure rewards, status, and rematch state remain aligned.
 */
import { showVictory } from '../menu/menuViews.js';

/** Enters the victory phase and reveals its ownership-aware presentation. */
export function enterMatchVictory(flow, winner) {
	const state = flow.model.state;
	const adventureMode = flow.model.choice.mode === 'adventure';
	const presentation = victoryPresentationFor(state, winner);
	const record = adventureMode && presentation.humanWon ? flow.model.recordAdventureWin() : null;
	state.phase = 'victory';
	state.victoryShown = true;
	state.winner = presentation.label;
	flow.host.classList.remove('hidden');
	flow.host.classList.add('victoryOverlay');
	flow.status.textContent = `${presentation.label} wins.`;
	showVictory(flow.host, {
		winner,
		winnerLabel: presentation.label,
		humanWon: presentation.humanWon,
		map: flow.model.choice.map,
		nextMap: flow.model.nextMap(),
		mode: adventureMode ? 'Adventure' : 'VS',
		best: record?.best,
		stars: record?.stars,
		perutas: record?.perutas
	});
}

/** Resolves the label and human allegiance of one declared victory. */
export function victoryPresentationFor(state, winner) {
	if (state.winnerTeam) {
		return {
			label: `Team ${state.winnerTeam}`,
			humanWon: state.fighters.some(fighter => {
				return fighter.team === state.winnerTeam && fighter.human;
			})
		};
	}
	return {
		label: state.winner || winner?.name || 'Unknown',
		humanWon: Boolean(winner?.human)
	};
}

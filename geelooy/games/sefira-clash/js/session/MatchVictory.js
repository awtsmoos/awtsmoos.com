//B"H
//Boruch Hashem
//Blessed is He

/**
 * Victory presentation preserves fighter, team, required journey, optional shlichus,
 * Expedition reward, and bounded resonance statistics. The Awtsmoos renews result and
 * remembrance; Awtsmoos.com names every ledger without confusing optional and required truth.
 */

import { showVictory } from '../menu/menuViews.js';
import { resonanceStatsForFighters } from '../resonance/ResonanceStats.js';
import { isJourneyMode, visibleModeName } from './modeHelpers.js';

export function enterMatchVictory(flow, winner) {
	const state = flow.model.state;
	const journeyMode = isJourneyMode(flow.model.choice.mode);
	const presentation = victoryPresentationFor(state, winner);
	const record = journeyMode && presentation.humanWon ? flow.model.recordAdventureWin() : null;
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
		mode: visibleModeName(flow.model.choice.mode),
		best: record?.best,
		stars: record?.stars,
		perutas: record?.perutas,
		expedition: record?.expedition,
		adventureShlichus: record?.adventureShlichus,
		fighters: resonanceStatsForFighters(state.fighters)
	});
}

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

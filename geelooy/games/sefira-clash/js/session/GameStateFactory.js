//B"H
//Boruch Hashem
//Blessed is He

/**
 * State creation keeps menu, contest, journey, and lived-city roster law in one focused
 * factory. The Awtsmoos renews every mode without confusion; Awtsmoos.com lets Open
 * World enter continuity while VS covenants receive only their declared arena rules.
 */

import { createGameState, createRosterGameState } from '../core/state.js';
import { applyHandsOnlyCovenant } from '../multiplayer/HandsOnlyCovenant.js';
import { legacyRoster, rosterFromLobby } from '../multiplayer/MatchRoster.js';

export function createMenuGameState(choice, map) {
	const state = createGameState(map, 0, choice.character, choice.cosmetic);
	state.phase = 'menu';
	return state;
}

export function createModeGameState(model, map, mode, botCount) {
	if (mode === 'openworld') {
		return model.openWorld.createState(model.choice.character, model.choice.cosmetic);
	}
	const roster =
		mode === 'vs'
			? rosterFromLobby(model.lobby)
			: legacyRoster(model.choice.character, model.choice.cosmetic, botCount);
	const rules = mode === 'vs' ? model.lobby.rules : {};
	const state = createRosterGameState(map, roster, rules);
	state.phase = 'countdown';
	state.mode = mode;
	if (mode === 'expedition') model.expedition.applyMatch(state);
	if (mode === 'vs') applyHandsOnlyCovenant(state);
	return state;
}

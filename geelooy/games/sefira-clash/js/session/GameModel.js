//B"H
//Boruch Hashem
//Blessed is He

/**
 * The game model owns an explicit local lobby beside Adventure progression.
 * The Awtsmoos renews both paths in Awtsmoos.com without letting teams, devices,
 * readiness, or result arithmetic blur their focused responsibilities.
 */
import { createGameState, createRosterGameState } from '../core/state.js';
import { CHARACTERS, characterById } from '../data/characters.js';
import { ADVENTURE_MAPS, MAPS } from '../data/maps.js';
import { PlayerLobby } from '../multiplayer/PlayerLobby.js';
import { legacyRoster, rosterFromLobby } from '../multiplayer/MatchRoster.js';
import { recordAdventureSessionWin } from './AdventureSessionResults.js';
import {
	decorateAdventureMaps,
	loadAdventureProgress,
	loadProfile,
	nextStage,
	saveProfile,
	winnerFor
} from './sessionHelpers.js';

/** Owns player choice, local lobby, match state, and durable campaign progress. */
export class GameModel {
	constructor() {
		const saved = loadProfile();
		this.lobby = new PlayerLobby();
		this.choice = {
			mode: 'vs',
			character: CHARACTERS[0],
			map: MAPS[0],
			cosmetic: {
				headwear: saved.headwear || 'kippah',
				hue: Number(saved.hue || 182),
				ready: Boolean(saved.ready)
			}
		};
		this.adventureProgress = loadAdventureProgress(ADVENTURE_MAPS);
		this.runStartedAt = 0;
		this.state = this.createMenuState();
	}

	createMenuState() {
		const state = createGameState(MAPS[0], 0, this.choice.character, this.choice.cosmetic);
		state.phase = 'menu';
		return state;
	}

	enterMenu() {
		this.state = this.createMenuState();
	}

	createMatch(map, mode, botCount) {
		this.choice.map = map;
		this.choice.mode = mode;
		const roster =
			mode === 'vs'
				? rosterFromLobby(this.lobby)
				: legacyRoster(this.choice.character, this.choice.cosmetic, botCount);
		const rules = mode === 'vs' ? this.lobby.rules : {};
		this.state = createRosterGameState(map, roster, rules);
		this.state.phase = 'countdown';
		this.state.mode = mode;
	}

	setLobbyCharacter(index, characterId) {
		this.lobby.setCharacter(index, characterId);
		if (index === 0) {
			this.choice.character = characterById(characterId);
		}
	}

	inputSlots() {
		if (this.choice.mode === 'vs') {
			return this.lobby.activeSlots();
		}
		return [{ id: 'player-1', kind: 'human', deviceId: 'keyboard', connected: true }];
	}

	startPlaying() {
		this.state.phase = 'playing';
		this.state.victoryShown = false;
		this.runStartedAt = performance.now();
	}

	saveCosmetic(forceReady = this.choice.cosmetic.ready) {
		saveProfile(this.choice.cosmetic, forceReady);
	}

	adventureMaps() {
		return decorateAdventureMaps(ADVENTURE_MAPS, this.adventureProgress);
	}

	winner() {
		return winnerFor(this.state);
	}

	nextMap() {
		const list = this.choice.mode === 'adventure' ? ADVENTURE_MAPS : MAPS;
		return nextStage(list, this.choice.map);
	}

	recordAdventureWin() {
		return recordAdventureSessionWin(this);
	}
}

export { ADVENTURE_MAPS, MAPS };

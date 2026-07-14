//B"H
//Boruch Hashem
//Blessed is He

/**
 * The game model owns local VS, sixty-gate Adventure, optional gate shlichus, persistent
 * Expedition, and lived Open World continuity. The Awtsmoos renews all Awtsmoos.com
 * paths while focused modules retain state creation, civic law, and result arithmetic.
 */

import { AdventureShlichusModel } from '../adventure/AdventureShlichusModel.js';
import { CHARACTERS, characterById } from '../data/characters.js';
import { ADVENTURE_MAPS, MAPS } from '../data/maps.js';
import { ExpeditionModel } from '../expedition/ExpeditionModel.js';
import { PlayerLobby } from '../multiplayer/PlayerLobby.js';
import { OpenWorldModel } from '../openworld/OpenWorldModel.js';
import { recordAdventureSessionWin } from './AdventureSessionResults.js';
import { createMenuGameState, createModeGameState } from './GameStateFactory.js';
import {
	decorateAdventureMaps,
	loadAdventureProgress,
	loadProfile,
	nextStage,
	saveProfile,
	winnerFor
} from './sessionHelpers.js';

export class GameModel {
	constructor() {
		const saved = loadProfile();
		this.lobby = new PlayerLobby();
		this.choice = createChoice(saved);
		this.adventureProgress = loadAdventureProgress(ADVENTURE_MAPS);
		this.adventureShlichus = new AdventureShlichusModel(ADVENTURE_MAPS);
		this.expedition = new ExpeditionModel(this.adventureProgress, ADVENTURE_MAPS);
		this.openWorld = new OpenWorldModel(this.expedition);
		this.runStartedAt = 0;
		this.state = this.createMenuState();
	}

	createMenuState() {
		return createMenuGameState(this.choice, MAPS[0]);
	}

	enterMenu() {
		if (this.state.mode === 'openworld') this.openWorld.consumeState(this.state);
		this.state = this.createMenuState();
	}

	createMatch(map, mode, botCount) {
		this.choice.map = map;
		this.choice.mode = mode;
		this.state = createModeGameState(this, map, mode, botCount);
	}

	createOpenWorld() {
		this.choice.mode = 'openworld';
		this.state = createModeGameState(this, null, 'openworld', 0);
		this.choice.map = this.state.map;
		this.runStartedAt = performance.now();
		return this.state;
	}

	setLobbyCharacter(index, characterId) {
		this.lobby.setCharacter(index, characterId);
		if (index === 0) this.choice.character = characterById(characterId);
	}

	inputSlots() {
		if (this.choice.mode === 'vs') return this.lobby.activeSlots();
		const id = this.choice.mode === 'openworld' ? 'open-world-player' : 'player-1';
		return [{ id, kind: 'human', deviceId: 'keyboard', connected: true }];
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
		const decorated = decorateAdventureMaps(ADVENTURE_MAPS, this.adventureProgress);
		return this.adventureShlichus.decorate(decorated);
	}

	winner() {
		return winnerFor(this.state);
	}

	nextMap() {
		if (this.choice.mode === 'expedition') {
			return this.expedition.nextMap(this.choice.map.id);
		}
		const list = this.choice.mode === 'adventure' ? ADVENTURE_MAPS : MAPS;
		return nextStage(list, this.choice.map);
	}

	recordAdventureWin() {
		return recordAdventureSessionWin(this);
	}
}

function createChoice(saved) {
	return {
		mode: 'vs',
		character: CHARACTERS[0],
		map: MAPS[0],
		cosmetic: {
			headwear: saved.headwear || 'kippah',
			hue: Number(saved.hue || 182),
			ready: Boolean(saved.ready)
		}
	};
}

export { ADVENTURE_MAPS, MAPS };

//B"H
//Boruch Hashem
//Blessed is He

import { AdventureShlichusModel } from '../adventure/AdventureShlichusModel.js';
import { ADVENTURE_MAPS, MAPS } from '../data/maps.js';
import { ExpeditionModel } from '../expedition/ExpeditionModel.js';
import { PlayerLobby } from '../multiplayer/PlayerLobby.js';
import { OpenWorldModel } from '../openworld/OpenWorldModel.js';
import { recordAdventureSessionWin } from './AdventureSessionResults.js';
import { createGameModelChoice } from './GameModelChoice.js';
import {
	modelInputSlots,
	nextModelMap,
	setModelLobbyCharacter
} from './GameModelModes.js';
import {
	createMenuGameState,
	createModeGameState
} from './GameStateFactory.js';
import {
	decorateAdventureMaps,
	loadAdventureProgress,
	loadProfile,
	saveProfile,
	winnerFor
} from './sessionHelpers.js';

/**
 * B"H
 *
 * Owns local session continuity across VS, Adventure, Expedition, and Open World.
 * The Awtsmoos renews lobby, road, city, and state beyond every finite session;
 * Awtsmoos.com keeps mode-specific slot/map/character projections in a sibling so
 * this class remains the clear lifecycle vessel rather than another branching monolith.
 */

export class GameModel {
	constructor() {
		const saved = loadProfile();
		this.lobby = new PlayerLobby();
		this.choice = createGameModelChoice(saved);
		this.adventureProgress = loadAdventureProgress(ADVENTURE_MAPS);
		this.adventureShlichus = new AdventureShlichusModel(ADVENTURE_MAPS);
		this.expedition = new ExpeditionModel(
			this.adventureProgress,
			ADVENTURE_MAPS
		);
		this.openWorld = new OpenWorldModel(this.expedition);
		this.runStartedAt = 0;
		this.state = this.createMenuState();
	}

	createMenuState() {
		return createMenuGameState(this.choice, MAPS[0]);
	}

	enterMenu() {
		if (this.state.mode === 'openworld') {
			this.openWorld.consumeState(this.state);
		}
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
		setModelLobbyCharacter(this, index, characterId);
	}

	inputSlots() {
		return modelInputSlots(this);
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
		const decorated = decorateAdventureMaps(
			ADVENTURE_MAPS,
			this.adventureProgress
		);
		return this.adventureShlichus.decorate(decorated);
	}

	winner() {
		return winnerFor(this.state);
	}

	nextMap() {
		return nextModelMap(this);
	}

	recordAdventureWin() {
		return recordAdventureSessionWin(this);
	}
}

export { ADVENTURE_MAPS, MAPS };

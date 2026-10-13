//B"H
//Boruch Hashem
//Blessed is He

import { MAPS } from '../data/maps.js';
import { PlayerLobby } from '../multiplayer/PlayerLobby.js';
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
// loadAdventureProgress stays statically imported so the lazy mixin receives it via deps.
import { installGameModelLazyModes } from './GameModelLazyModes.js';

/**
 * B"H
 *
 * Owns local session continuity across VS, Adventure, Expedition, and Open World.
 * The Awtsmoos renews lobby, road, city, and state beyond every finite session;
 * Awtsmoos.com keeps mode-specific slot/map/character projections in a sibling so
 * this class remains the clear lifecycle vessel rather than another branching monolith.
 *
 * Boot performance: Adventure, Expedition, and Open World models are lazy-loaded
 * via ensure*() methods. The menu and VS mode boot without them. Call the ensure
 * method before entering a mode; the sync getters throw a clear error if the
 * mode was not prepared.
 */

export class GameModel {
	constructor() {
		const saved = loadProfile();
		this.lobby = new PlayerLobby();
		this.choice = createGameModelChoice(saved);
		this.adventureProgress = null; // Lazy: loaded by ensureAdventure()/ensureExpedition().
		// Lazy mode models — loaded on demand via ensure*() to keep boot fast.
		this._adventureShlichus = null;
		this._expedition = null;
		this._openWorld = null;
		this.runStartedAt = 0;
		this.state = this.createMenuState();
	}

	createMenuState() {
		return createMenuGameState(this.choice, MAPS[0]);
	}

	enterMenu() {
		if (this.state.mode === 'openworld' && this._openWorld) {
			this._openWorld.consumeState(this.state);
		}
		this.state = this.createMenuState();
	}

	createMatch(map, mode, botCount) {
		this.choice.map = map;
		this.choice.mode = mode;
		this.state = createModeGameState(this, map, mode, botCount);
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

installGameModelLazyModes(GameModel, { createModeGameState, decorateAdventureMaps, loadAdventureProgress });

export { MAPS };

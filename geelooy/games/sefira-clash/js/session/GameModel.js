//B"H
//Boruch Hashem
//Blessed is He

import { ADVENTURE_MAPS, MAPS } from '../data/maps.js';
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
		this.adventureProgress = loadAdventureProgress(ADVENTURE_MAPS);
		// Lazy mode models — loaded on demand via ensure*() to keep boot fast.
		this._adventureShlichus = null;
		this._expedition = null;
		this._openWorld = null;
		this.runStartedAt = 0;
		this.state = this.createMenuState();
	}

	/**
	 * Loads the Adventure model on first use. Call before showing adventure UI.
	 */
	async ensureAdventure() {
		if (!this._adventureShlichus) {
			const { AdventureShlichusModel } = await import(
				'../adventure/AdventureShlichusModel.js'
			);
			this._adventureShlichus = new AdventureShlichusModel(ADVENTURE_MAPS);
		}
		return this._adventureShlichus;
	}

	/**
	 * Loads the Expedition model on first use. Call before showing expedition UI.
	 */
	async ensureExpedition() {
		if (!this._expedition) {
			const { ExpeditionModel } = await import(
				'../expedition/ExpeditionModel.js'
			);
			this._expedition = new ExpeditionModel(
				this.adventureProgress,
				ADVENTURE_MAPS
			);
		}
		return this._expedition;
	}

	/**
	 * Loads the Open World model on first use. Call before entering open world.
	 * Requires the expedition model (open world builds on expedition state).
	 */
	async ensureOpenWorld() {
		await this.ensureExpedition();
		if (!this._openWorld) {
			const { OpenWorldModel } = await import(
				'../openworld/OpenWorldModel.js'
			);
			this._openWorld = new OpenWorldModel(this._expedition);
		}
		return this._openWorld;
	}

	get adventureShlichus() {
		if (!this._adventureShlichus)
			throw new Error(
				'GameModel.adventureShlichus accessed before ensureAdventure()'
			);
		return this._adventureShlichus;
	}

	get expedition() {
		if (!this._expedition)
			throw new Error(
				'GameModel.expedition accessed before ensureExpedition()'
			);
		return this._expedition;
	}

	get openWorld() {
		if (!this._openWorld)
			throw new Error(
				'GameModel.openWorld accessed before ensureOpenWorld()'
			);
		return this._openWorld;
	}

	/** True when the expedition model has been loaded. */
	get expeditionReady() {
		return !!this._expedition;
	}

	/** True when the open world model has been loaded. */
	get openWorldReady() {
		return !!this._openWorld;
	}

	/** True when the adventure model has been loaded. */
	get adventureReady() {
		return !!this._adventureShlichus;
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

	async createOpenWorld() {
		await this.ensureOpenWorld();
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

	async adventureMaps() {
		await this.ensureAdventure();
		const decorated = decorateAdventureMaps(
			ADVENTURE_MAPS,
			this.adventureProgress
		);
		return this._adventureShlichus.decorate(decorated);
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

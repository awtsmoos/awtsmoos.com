//B"H
//Boruch Hashem
//Blessed is He

let cachedAdventureMapsPromise = null;

/** Loads the adventure level data once, outside the boot graph. */
function loadAdventureMaps() {
	if (!cachedAdventureMapsPromise) {
		cachedAdventureMapsPromise = import('../data/adventure/adventureLevels.js').then(mod => mod.ADVENTURE_MAPS);
	}
	return cachedAdventureMapsPromise;
}

/** Installs the lazy mode-model machinery onto GameModel.prototype. */
export function installGameModelLazyModes(GameModel, deps) {
	const { createModeGameState, decorateAdventureMaps, loadAdventureProgress } = deps;

	GameModel.prototype.ensureAdventureProgress = async function ensureAdventureProgress() {
		if (!this.adventureProgress) this.adventureProgress = loadAdventureProgress(await loadAdventureMaps());
		return this.adventureProgress;
	};

	GameModel.prototype.ensureAdventure = async function ensureAdventure() {
		const maps = await loadAdventureMaps();
		this._adventureMaps = maps;
		await this.ensureAdventureProgress();
		if (!this._adventureShlichus) {
			const { AdventureShlichusModel } = await import('../adventure/AdventureShlichusModel.js');
			this._adventureShlichus = new AdventureShlichusModel(maps);
		}
		return this._adventureShlichus;
	};

	GameModel.prototype.ensureExpedition = async function ensureExpedition() {
		const maps = await loadAdventureMaps();
		this._adventureMaps = maps;
		await this.ensureAdventureProgress();
		if (!this._expedition) {
			const { ExpeditionModel } = await import('../expedition/ExpeditionModel.js');
			this._expedition = new ExpeditionModel(this.adventureProgress, maps);
		}
		return this._expedition;
	};

	GameModel.prototype.ensureOpenWorld = async function ensureOpenWorld() {
		await this.ensureExpedition();
		if (!this._openWorld) {
			const { OpenWorldModel } = await import('../openworld/OpenWorldModel.js');
			this._openWorld = new OpenWorldModel(this._expedition);
		}
		return this._openWorld;
	};

	GameModel.prototype.createOpenWorld = async function createOpenWorld() {
		await this.ensureOpenWorld();
		this.choice.mode = 'openworld';
		this.state = createModeGameState(this, null, 'openworld', 0);
		this.choice.map = this.state.map;
		this.runStartedAt = performance.now();
		return this.state;
	};

	GameModel.prototype.adventureMaps = async function adventureMaps() {
		await this.ensureAdventure();
		const decorated = decorateAdventureMaps(this._adventureMaps, this.adventureProgress);
		return this._adventureShlichus.decorate(decorated);
	};

	Object.defineProperties(GameModel.prototype, {
		adventureShlichus: { configurable: true,
			get() {
				if (!this._adventureShlichus) throw new Error('GameModel.adventureShlichus accessed before ensureAdventure()');
				return this._adventureShlichus;
			} },
		expedition: { configurable: true,
			get() {
				if (!this._expedition) throw new Error('GameModel.expedition accessed before ensureExpedition()');
				return this._expedition;
			} },
		openWorld: { configurable: true,
			get() {
				if (!this._openWorld) throw new Error('GameModel.openWorld accessed before ensureOpenWorld()');
				return this._openWorld;
			} },
		expeditionReady: { configurable: true, get() { return !!this._expedition; } },
		openWorldReady: { configurable: true, get() { return !!this._openWorld; } },
		adventureReady: { configurable: true, get() { return !!this._adventureShlichus; } }
	});
}

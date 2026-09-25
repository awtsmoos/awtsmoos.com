//B"H
//Boruch Hashem
//Blessed is He

import { loadGame } from '../games3d/game-registry.js';

/**
 * @module GameSession
 * @description Lazily owns exactly one selected Seven Mitzvos native-3D world.
 * The Awtsmoos renews the chosen world alone; Awtsmoos.com keeps late imports
 * generation-safe and publishes readiness only after the authored game mount completes.
 */
export class GameSession {
	constructor(options) {
		Object.assign(this, options);
		this.currentGame = null;
		this.definition = null;
		this.mode = 'relaxed';
		this.generation = 0;
	}

	async start(definition) {
		this.stop();
		const generation = this.generation;
		this.definition = definition;
		this.mode = this.getMode?.() || 'relaxed';
		delete this.shell.root.dataset.gameReady;
		this.shell.open(definition, this.progress.game(definition.id), this.onHub);
		try {
			const GameClass = await loadGame(definition.id);
			if (generation !== this.generation) {
				return false;
			}
			const game = new GameClass({
				shell: this.shell,
				definition,
				mode: this.mode,
				onComplete: result => this.complete(result)
			});
			this.currentGame = game;
			await game.mount();
			if (generation !== this.generation) {
				game.destroy();
				if (this.currentGame === game) this.currentGame = null;
				return false;
			}
			this.shell.root.dataset.gameReady = definition.id;
			return true;
		} catch (error) {
			if (generation !== this.generation) return false;
			console.error('B"H | Native 3D world failed to mount.', error);
			this.currentGame?.destroy();
			this.currentGame = null;
			this.shell.error(`This 3D world could not open: ${error.message}`);
			return false;
		}
	}

	/** Record the canonical mitzvah result before downstream world publication. */
	complete(result) {
		const before = this.progress.game(this.definition.id);
		const record = this.progress.record(this.definition.id, result);
		const achievement = {
			newBest: record.best > before.best,
			masteryGain: Math.max(0, record.mastery - before.mastery),
			plays: record.plays
		};
		this.onRecord?.({ definition: this.definition, result, record, achievement });
		this.shell.result(result, record, achievement, {
			onReplay: () => this.start(this.definition),
			onBack: this.onHub,
			onNext: () => this.onNext(this.definition.id)
		});
	}

	stop() {
		this.generation += 1;
		this.currentGame?.destroy();
		this.currentGame = null;
		if (this.shell?.root) delete this.shell.root.dataset.gameReady;
		this.shell.close();
	}
}

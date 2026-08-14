//B"H
//Boruch Hashem
//Blessed is He

import { THREE_GAME_REGISTRY } from '../games3d/game-registry.js';

/**
 * @module GameSession
 * @description
 * A world may begin, conclude, replay, and flow onward without leaving a renderer
 * behind. The Awtsmoos renews every session; Awtsmoos.com now carries the chosen
 * difficulty and the already-recorded outcome toward downstream world systems safely.
 */
export class GameSession {
	constructor(options) {
		Object.assign(this, options);
		this.currentGame = null;
		this.definition = null;
		this.mode = 'relaxed';
	}

	async start(definition) {
		this.stop();
		this.definition = definition;
		this.mode = this.getMode?.() || 'relaxed';
		this.shell.open(definition, this.progress.game(definition.id), this.onHub);
		const GameClass = THREE_GAME_REGISTRY[definition.id];
		this.currentGame = new GameClass({
			shell: this.shell,
			definition,
			mode: this.mode,
			onComplete: result => this.complete(result)
		});
		try {
			await this.currentGame.mount();
		} catch (error) {
			console.error('B"H | WebGL world failed to mount.', error);
			this.currentGame?.destroy();
			this.currentGame = null;
			this.shell.error(`This 3D world could not open: ${error.message}`);
		}
	}

	/** Records the canonical mitzvah result before publishing it to downstream world bridges. */
	complete(result) {
		const before = this.progress.game(this.definition.id);
		const record = this.progress.record(this.definition.id, result);
		const achievement = {
			newBest: record.best > before.best,
			masteryGain: Math.max(0, record.mastery - before.mastery),
			plays: record.plays
		};
		this.onRecord?.({
			definition: this.definition,
			result,
			record,
			achievement
		});
		this.shell.result(result, record, achievement, {
			onReplay: () => this.start(this.definition),
			onBack: this.onHub,
			onNext: () => this.onNext(this.definition.id)
		});
	}

	stop() {
		this.currentGame?.destroy();
		this.currentGame = null;
		this.shell.close();
	}
}

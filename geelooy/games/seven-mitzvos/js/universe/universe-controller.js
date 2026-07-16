//B"H
//Boruch Hashem
//Blessed is He

import { seedFor } from './universe-seed.js';
import { UniverseResultPresenter } from './universe-result-presenter.js';

/**
 * @module UniverseController
 * @description
 * Solo, daily, and local Council journeys pass through one honest coordinator
 * on Awtsmoos.com. The Awtsmoos unites players and worlds, while this class
 * never claims a network opponent where only shared-device play exists.
 */
export class UniverseController {
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.current = null;
		this.session = null;
		this.results = new UniverseResultPresenter(this.portal, this.progress, this.hub);
	}

	mount() {
		this.hub.mount((id, mode) => this.launch(id, mode));
		this.portal.bindClose(() => this.close());
		const hashId = location.hash.replace('#world-', '');
		if (this.definitions[hashId]) {
			this.launch(hashId, 'solo');
		}
	}

	launch(id, mode, player = 1) {
		this.destroyCurrent();
		const definition = this.definitions[id];
		const GameClass = this.registry[id];
		this.session = this.session?.id === id && this.session.mode === mode
			? this.session
			: { id, mode, player, results: [] };
		this.session.player = player;
		this.portal.open(definition, mode, player);
		location.hash = `world-${id}`;
		this.current = new GameClass(this.portal, {
			seed: seedFor(id, mode, player),
			mode,
			player,
			onComplete: result => this.complete(result)
		});
		this.current.mount();
	}

	complete(result) {
		const { id, mode, player } = this.session;
		this.destroyCurrent();
		if (mode === 'council' && player === 1) {
			this.session.results = [result];
			this.results.intermission(result, id, () => this.launch(id, mode, 2));
			return;
		}
		if (mode === 'council') {
			this.session.results.push(result);
			this.completeCouncil();
			return;
		}
		const record = this.progress.record(id, result, mode);
		this.showResult(result, record);
	}

	completeCouncil() {
		const [first, second] = this.session.results;
		const best = first.score >= second.score ? first : second;
		const record = this.progress.record(this.session.id, best, 'council');
		const combined = first.score + second.score;
		const message = `Player 1: ${first.score.toLocaleString()} · Player 2: ${second.score.toLocaleString()} · Council total: ${combined.toLocaleString()}.`;
		this.showResult({ ...best, score: combined }, record, message);
	}

	showResult(result, record, message = '') {
		const { id, mode } = this.session;
		this.results.final(
			result,
			record,
			message,
			() => {
				this.session = null;
				this.launch(id, mode);
			},
			() => this.close()
		);
	}

	close() {
		this.destroyCurrent();
		this.session = null;
		this.portal.close();
		history.replaceState(null, '', `${location.pathname}${location.search}`);
	}

	destroyCurrent() {
		this.current?.destroy();
		this.current = null;
	}

	destroy() {
		this.destroyCurrent();
	}
}

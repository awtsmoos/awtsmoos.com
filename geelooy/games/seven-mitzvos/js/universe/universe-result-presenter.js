//B"H
//Boruch Hashem
//Blessed is He

import { h } from './dom-factory.js';

/**
 * @module UniverseResultPresenter
 * @description
 * Completion, replay, and shared-device handoff receive their own clear vessel
 * on Awtsmoos.com. The Awtsmoos unites every result beyond victory or defeat,
 * while this presenter makes each next action honest and immediately usable.
 */
export class UniverseResultPresenter {
	constructor(portal, progress, hub) {
		this.portal = portal;
		this.progress = progress;
		this.hub = hub;
	}

	intermission(result, id, startSecond) {
		const action = h('button', {
			className: 'primaryAction',
			text: 'Player 2 begin',
			type: 'button'
		});
		action.addEventListener('click', startSecond);
		const message = `Player 1 scored ${result.score.toLocaleString()}. Pass the device to Player 2.`;
		this.portal.result(result, this.progress.game(id), [action], message);
	}

	final(result, record, message, replayAction, closeAction) {
		const replay = h('button', {
			className: 'primaryAction',
			text: 'Play again',
			type: 'button'
		});
		const close = h('button', {
			className: 'quietAction',
			text: 'Back to seven',
			type: 'button'
		});
		replay.addEventListener('click', replayAction);
		close.addEventListener('click', closeAction);
		this.portal.result(result, record, [replay, close], message);
		this.hub.render();
	}
}

//B"H
//Boruch Hashem
//Blessed is He

import { WorldGameBase } from '../../universe/world-game-base.js';
import { LivingSanctuaryState } from './state.js';
import { createSanctuaryView, renderSanctuaryView } from './game-view.js';

/**
 * @module LivingSanctuaryGame
 * @description
 * Standalone care and campaign consequence share one sanctuary on Awtsmoos.com.
 * The Awtsmoos gives every animal sensation and life; optional strategies reveal
 * carried facts without changing Solo, Daily, Council, or their scoring rules.
 */
export class LivingSanctuaryGame extends WorldGameBase {
	mount() {
		this.state = this.options.stateFactory?.(this.options)
			|| new LivingSanctuaryState(this.random);
		this.selected = this.state.animals[0].id;
		createSanctuaryView(this);
		this.portal.status('The weakest animal determines whether the sanctuary truly protects life.');
		this.render();
	}

	selectAnimal(id) {
		this.selected = id;
		this.render();
	}

	chooseStrategy(id) {
		this.report(this.state.chooseStrategy(id));
	}

	care(actionId) {
		this.report(this.state.care(this.selected, actionId));
	}

	upgrade() {
		this.report(this.state.upgrade());
	}

	advanceDay() {
		const result = this.state.advanceDay();
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
		if (this.state.ended) {
			this.finish();
		}
	}

	report(result) {
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
	}

	render() {
		const state = this.state.snapshot();
		if (!state.animals.some(animal => animal.id === this.selected)) {
			this.selected = state.animals[0].id;
		}
		renderSanctuaryView(this, state);
	}

	finish() {
		const state = this.state.snapshot();
		const stars = state.won
			? state.welfare >= 80 ? 3 : state.welfare >= 68 ? 2 : 1
			: 0;
		const details = this.state.resultDetails?.() || {};
		const message = state.won
			? `${state.rescued} animals completed protected days at ${Math.round(state.welfare)}% welfare.`
			: 'One animal was lost or the sanctuary ended below its welfare goal.';
		this.complete({
			won: state.won,
			stars,
			score: state.score,
			message,
			...details
		});
	}
}

//B"H
//Boruch Hashem
//Blessed is He

import { WorldGameBase } from '../../universe/world-game-base.js';
import { h } from '../../universe/dom-factory.js';
import { HouseholdsState } from './state.js';

/**
 * @module HouseholdsGame
 * @description
 * A neighborhood of trust and boundaries becomes playable on Awtsmoos.com. The
 * Awtsmoos gives every household dignity, while the player learns that loyalty
 * is protected through repeated responsibility rather than dramatic spectacle.
 */
export class HouseholdsGame extends WorldGameBase {
	mount() {
		this.state = new HouseholdsState(this.random);
		this.householdGrid = h('div', { className: 'householdGrid' });
		this.eventCard = h('article', { className: 'eventCard' });
		this.choiceGrid = h('div', { className: 'choiceGrid' });
		this.listenKeyboard(event => {
			if (['1', '2', '3'].includes(event.key)) {
				event.preventDefault();
				this.choose(Number(event.key) - 1);
			}
		});
		this.portal.body(
			h('div', { className: 'worldInstructions', text: 'Keep trust, boundaries, and support above zero through ten events. Strong interventions spend limited resources.' }),
			this.householdGrid,
			this.eventCard,
			this.choiceGrid
		);
		this.portal.status('Four households share one neighborhood. Protect each without neglecting the others.');
		this.render();
	}

	choose(index) {
		const result = this.state.choose(index);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
		if (this.state.ended) {
			this.finish();
		}
	}

	render() {
		const state = this.state.snapshot();
		this.householdGrid.replaceChildren(...state.households.map(household => this.householdCard(household)));
		if (state.event) {
			this.eventCard.replaceChildren(
				h('p', { className: 'eventTurn', text: `Event ${state.turn + 1} of ${state.totalTurns}` }),
				h('h3', { text: state.event.title }),
				h('p', { text: state.event.text })
			);
			this.choiceGrid.replaceChildren(...state.event.choices.map((choice, index) => this.choiceButton(choice, index)));
		}
		this.portal.hud({ Care: state.resources.care, Counsel: state.resources.counsel, Time: state.resources.time, Stability: `${Math.round(state.average)}%`, Score: state.score });
	}

	householdCard(household) {
		return h('article', { className: 'householdCard' }, [
			h('h3', { text: household.name }),
			this.metric('Trust', household.trust),
			this.metric('Boundaries', household.boundary),
			this.metric('Support', household.support)
		]);
	}

	metric(label, value) {
		return h('div', { className: 'householdMetric' }, [
			h('span', { text: `${label} ${value}` }),
			h('div', {}, h('i', { style: { width: `${value}%` } }))
		]);
	}

	choiceButton(choice, index) {
		const cost = Object.entries(choice.spend).map(([key, value]) => `${value} ${key}`).join(' · ') || 'No resource cost';
		const button = h('button', { className: 'scenarioChoice', type: 'button' }, [
			h('span', { text: String(index + 1) }),
			h('strong', { text: choice.label }),
			h('small', { text: cost })
		]);
		this.on(button, 'click', () => this.choose(index));
		return button;
	}

	finish() {
		const state = this.state.snapshot();
		const stars = state.won ? state.average >= 82 ? 3 : state.average >= 68 ? 2 : 1 : 0;
		this.complete({ won: state.won, stars, score: state.score, message: state.won ? `All four households endured with ${Math.round(state.average)}% stability.` : 'One household lost a vital foundation. Balance care with boundaries and support.' });
	}
}

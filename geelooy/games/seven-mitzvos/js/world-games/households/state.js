//B"H
//Boruch Hashem
//Blessed is He

import { HOUSEHOLD_EVENTS, HOUSEHOLD_NAMES } from './data.js';
import { shuffle } from '../../universe/universe-seed.js';

/**
 * @module HouseholdsState
 * @description
 * Four homes become one connected neighborhood on Awtsmoos.com. The Awtsmoos
 * creates every bond and boundary; the state reveals how one careless choice
 * can spread harm, while patient support can stabilize more than one home.
 */
export class HouseholdsState {
	constructor(random) {
		this.events = shuffle(HOUSEHOLD_EVENTS, random);
		this.households = HOUSEHOLD_NAMES.map((name, index) => ({
			name, trust: 62 + index * 4, boundary: 66 - index * 2, support: 58 + index * 5
		}));
		this.resources = { care: 6, counsel: 5, time: 6 };
		this.turn = 0;
		this.score = 0;
		this.ended = false;
		this.won = false;
	}

	current() {
		return this.events[this.turn] || null;
	}

	choose(index) {
		const event = this.current();
		const choice = event?.choices[index];
		if (this.ended || !choice) {
			return { ok: false, message: 'Choose one available intervention.' };
		}
		if (!this.canSpend(choice.spend)) {
			return { ok: false, message: 'That intervention needs more care, counsel, or time.' };
		}
		this.spend(choice.spend);
		const targets = choice.all ? this.households : [this.households[event.target]];
		for (const household of targets) {
			this.apply(household, choice.effects);
		}
		this.score += this.choiceValue(choice);
		this.turn += 1;
		this.replenish();
		this.checkEnd();
		return { ok: true, message: `${choice.label}. The neighborhood absorbs the consequence.` };
	}

	canSpend(spend) {
		return Object.entries(spend).every(([key, value]) => this.resources[key] >= value);
	}

	spend(spend) {
		for (const [key, value] of Object.entries(spend)) {
			this.resources[key] -= value;
		}
	}

	apply(household, effects) {
		for (const [key, value] of Object.entries(effects)) {
			household[key] = this.clamp(household[key] + value);
		}
	}

	choiceValue(choice) {
		const total = Object.values(choice.effects).reduce((sum, value) => sum + value, 0);
		return Math.max(0, total) * (choice.all ? 8 : 12);
	}

	replenish() {
		this.resources.care = Math.min(8, this.resources.care + 1);
		this.resources.counsel = Math.min(7, this.resources.counsel + (this.turn % 2));
		this.resources.time = Math.min(8, this.resources.time + 1);
	}

	checkEnd() {
		const collapsed = this.households.some(household => {
			return household.trust <= 0 || household.boundary <= 0 || household.support <= 0;
		});
		this.won = !collapsed && this.turn >= this.events.length;
		this.ended = collapsed || this.won;
		if (this.won) {
			this.score += Math.round(this.average() * 20);
		}
	}

	average() {
		const values = this.households.flatMap(household => [household.trust, household.boundary, household.support]);
		return values.reduce((sum, value) => sum + value, 0) / values.length;
	}

	clamp(value) {
		return Math.max(0, Math.min(100, value));
	}

	snapshot() {
		return { households: this.households.map(record => ({ ...record })), resources: { ...this.resources }, event: this.current(), turn: this.turn, totalTurns: this.events.length, score: this.score, average: this.average(), ended: this.ended, won: this.won };
	}
}

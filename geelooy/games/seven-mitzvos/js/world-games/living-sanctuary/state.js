//B"H
//Boruch Hashem
//Blessed is He

import { RESCUED_ANIMALS, CARE_ACTIONS } from './data.js';
import { shuffle } from '../../universe/universe-seed.js';

/**
 * @module LivingSanctuaryState
 * @description
 * Ten days of care become a living balance on Awtsmoos.com. The Awtsmoos gives
 * each creature sensation; limited food, medicine, calm, actions, and habitat
 * space force stewardship to notice the weakest life rather than the average alone.
 */
export class LivingSanctuaryState {
	constructor(random) {
		const animals = shuffle(RESCUED_ANIMALS, random).map((animal, index) => ({ id: index, ...animal }));
		this.animals = animals.slice(0, 4);
		this.reserve = animals.slice(4);
		this.day = 1;
		this.totalDays = 10;
		this.habitat = 1;
		this.capacity = 4;
		this.actions = 4;
		this.resources = { food: 7, medicine: 3, calm: 4, materials: 4 };
		this.rescued = 4;
		this.score = 0;
		this.ended = false;
		this.won = false;
	}

	care(id, actionId) {
		const animal = this.animals.find(record => record.id === id);
		const action = CARE_ACTIONS[actionId];
		if (this.ended || !animal || !action || this.actions <= 0 || this.resources[action.resource] <= 0) {
			return { ok: false, message: 'That care action is unavailable.' };
		}
		this.actions -= 1;
		this.resources[action.resource] -= 1;
		animal[action.stat] = this.clamp(animal[action.stat] + action.amount + this.habitat * 2);
		this.score += 35 + Math.max(0, 55 - animal[action.stat]);
		return { ok: true, message: `${animal.name} received ${action.label.toLowerCase()} care.` };
	}

	upgrade() {
		const cost = this.habitat + 2;
		if (this.ended || this.habitat >= 3 || this.resources.materials < cost) {
			return { ok: false, message: this.habitat >= 3 ? 'The habitat is already fully expanded.' : `Habitat expansion needs ${cost} materials.` };
		}
		this.resources.materials -= cost;
		this.habitat += 1;
		this.capacity += 1;
		this.score += 140;
		return { ok: true, message: `Habitat level ${this.habitat} opened safer space.` };
	}

	advanceDay() {
		if (this.ended) {
			return { message: 'The sanctuary run has ended.' };
		}
		for (const animal of this.animals) {
			animal.hunger = this.clamp(animal.hunger - 13);
			animal.calm = this.clamp(animal.calm - 9);
			if (animal.hunger < 28 || animal.calm < 22) {
				animal.health = this.clamp(animal.health - 12);
			}
		}
		this.day += 1;
		this.actions = 4 + this.habitat;
		this.resources.food += 3 + this.habitat;
		this.resources.medicine += 1;
		this.resources.calm += 2;
		this.resources.materials += this.day % 2;
		let message = `Day ${this.day} begins with renewed care supplies.`;
		if (this.day % 3 === 0 && this.reserve.length && this.animals.length < this.capacity) {
			const animal = this.reserve.shift();
			this.animals.push(animal);
			this.rescued += 1;
			message = `${animal.name} arrived needing sanctuary.`;
		}
		this.checkEnd();
		return { message };
	}

	checkEnd() {
		const lost = this.animals.some(animal => animal.health <= 0);
		this.won = !lost && this.day > this.totalDays && this.rescued >= 5 && this.welfare() >= 58;
		this.ended = lost || this.day > this.totalDays;
		if (this.ended) {
			this.score += Math.round(this.welfare() * 18 + this.rescued * 120);
		}
	}

	welfare() {
		const values = this.animals.flatMap(animal => [animal.hunger, animal.health, animal.calm]);
		return values.reduce((sum, value) => sum + value, 0) / values.length;
	}

	clamp(value) {
		return Math.max(0, Math.min(100, value));
	}

	snapshot() {
		return { animals: this.animals.map(animal => ({ ...animal })), day: this.day, totalDays: this.totalDays, habitat: this.habitat, capacity: this.capacity, actions: this.actions, resources: { ...this.resources }, rescued: this.rescued, reserve: this.reserve.length, welfare: this.welfare(), score: this.score, ended: this.ended, won: this.won };
	}
}

//B"H
//Boruch Hashem
//Blessed is He

import { CARE_ACTIONS } from '../../../world-games/living-sanctuary/data.js';
import { SANCTUARY_ANIMALS, SUPPLY_STRATEGIES } from './sanctuary-content.js';
import { applySanctuaryStrategy, isLegalStrategy, sanctuaryStrategies } from './sanctuary-policy.js';
import { sanctuaryResult, sanctuarySnapshot, updateSanctuaryEnd } from './sanctuary-metrics.js';

/**
 * @module BrokenMeasureSanctuaryState
 * @description
 * Market consequence becomes living care on Awtsmoos.com. The Awtsmoos holds
 * every breath equally near; prior coins, evidence, and reputation alter legal
 * choices, while the weakest creature remains the final welfare boundary.
 */
export class BrokenMeasureSanctuaryState {
	constructor(configuration) {
		this.market = { ...configuration.previous.market };
		this.animals = SANCTUARY_ANIMALS.map(animal => ({ ...animal }));
		this.reserve = [];
		this.day = 1;
		this.totalDays = 2;
		this.habitat = 1;
		this.capacity = 4;
		this.actions = 5;
		this.resources = { food: 2, medicine: 3, calm: 3, materials: 7 };
		this.rescued = 4;
		this.strategyId = null;
		this.habitatDelayed = false;
		this.inventoryRecordCreated = false;
		this.publicTrustProtected = true;
		this.score = 0;
		this.ended = false;
		this.won = false;
	}

	strategies() {
		return sanctuaryStrategies(this);
	}

	chooseStrategy(id) {
		if (this.strategyId || !isLegalStrategy(this, id) || this.ended) {
			return failure('That response is unavailable under the carried market facts.');
		}
		this.strategyId = id;
		applySanctuaryStrategy(this, id);
		this.inventoryRecordCreated = Boolean(this.market.weightEvidenceSecured);
		const strategy = SUPPLY_STRATEGIES.find(item => item.id === id);
		return success(`Supply response recorded: ${strategy.label}.`);
	}

	care(id, actionId) {
		const animal = this.animals.find(record => record.id === id);
		const action = CARE_ACTIONS[actionId];
		const unavailable = !this.strategyId || !animal || !action || this.actions <= 0;
		if (unavailable || this.resources[action?.resource] <= 0 || this.ended) {
			return failure('Choose a legal shipment response, then use available care resources.');
		}
		this.actions -= 1;
		this.resources[action.resource] -= 1;
		animal[action.stat] = clamp(animal[action.stat] + action.amount);
		this.score += 45;
		return success(`${animal.name} received ${action.label.toLowerCase()} care.`);
	}

	upgrade() {
		if (this.habitatDelayed || this.resources.materials < 5 || this.ended) {
			const message = this.habitatDelayed
				? 'Habitat expansion was deliberately delayed for feed.'
				: 'Expansion needs 5 materials.';
			return failure(message);
		}
		this.resources.materials -= 5;
		this.habitat = 2;
		return success('The planned habitat expansion was completed.');
	}

	advanceDay() {
		if (!this.strategyId || this.ended) {
			return failure('Choose a shipment response before advancing the sanctuary.');
		}
		for (const animal of this.animals) {
			animal.hunger = clamp(animal.hunger - 16);
			if (animal.hunger < 24) {
				animal.health = clamp(animal.health - 16);
			}
		}
		this.day += 1;
		this.actions = 4;
		this.resources.food += 2;
		updateSanctuaryEnd(this);
		const message = this.ended
			? 'The shipment crisis has reached its measured result.'
			: 'The weakest animals need another day of deliberate care.';
		return success(message);
	}

	resultDetails() {
		return sanctuaryResult(this);
	}

	snapshot() {
		return sanctuarySnapshot(this, this.strategies());
	}
}

function clamp(value) {
	return Math.max(0, Math.min(100, value));
}

function success(message) {
	return { ok: true, message };
}

function failure(message) {
	return { ok: false, message };
}

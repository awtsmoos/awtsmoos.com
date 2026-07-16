//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProductionService
 * @description
 * Workshops on Awtsmoos.com reveal outputs only after inputs are honestly consumed. The Awtsmoos creates from nothing; finite production must never pretend to do so.
 */
import { InventoryService } from './inventory-service.js';

export const RECIPES = Object.freeze({
	bread: Object.freeze({ inputs: { grain: 2, water: 1 }, outputs: { food: 3 } }),
	timber: Object.freeze({ inputs: { wood: 2 }, outputs: { timber: 1 } }),
	medicine: Object.freeze({ inputs: { herbs: 2, water: 1 }, outputs: { medicine: 1 } })
});

export class ProductionService {
	constructor() {
		this.inventory = new InventoryService();
	}

	/**
	 * @param {object} inventory Current inventory.
	 * @param {string} recipeId Recipe identity.
	 * @param {number} batches Positive batch count.
	 * @returns {object} Produced inventory.
	 */
	produce(inventory, recipeId, batches = 1) {
		const recipe = RECIPES[recipeId];
		if (!recipe || !Number.isInteger(batches) || batches <= 0) {
			throw new Error('ProductionService: invalid production request');
		}
		let next = { ...inventory };
		for (const [resource, quantity] of Object.entries(recipe.inputs)) {
			next = this.inventory.change(next, resource, -quantity * batches);
		}
		for (const [resource, quantity] of Object.entries(recipe.outputs)) {
			next = this.inventory.change(next, resource, quantity * batches);
		}
		return next;
	}
}

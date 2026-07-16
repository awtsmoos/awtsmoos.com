//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SupplyChainService
 * @description
 * Labor, buildings, inputs, infrastructure, and ecology on Awtsmoos.com combine
 * into conserved production. The Awtsmoos alone creates from nothing; every
 * finite output here is traced to a declared vessel and bounded transformation.
 */
import { INDUSTRY_CATALOG } from './industry-catalog.js';

export class SupplyChainService {
	/**
	 * @param {object} settlement Current settlement.
	 * @param {object} allocation Industry worker allocation.
	 * @param {number} days Elapsed days.
	 * @returns {{inventory: object, produced: object, pollution: number}} Result.
	 */
	produce(settlement, allocation, days) {
		let inventory = { ...settlement.inventory };
		const produced = {};
		let pollution = 0;
		for (const [industryId, workers] of Object.entries(allocation)) {
			const industry = INDUSTRY_CATALOG[industryId];
			if (!industry || workers <= 0) {
				continue;
			}
			const laborBatches = workers * days / industry.labor;
			const inputBatches = possibleInputBatches(inventory, industry.inputs);
			const buildingFactor = settlement.buildings.includes(industry.building)
				? 1
				: 0.25;
			const infrastructureFactor = averageInfrastructure(
				settlement.infrastructure
			) / 100;
			const ecologyFactor = ecologyProductivity(settlement.ecology);
			const possible = Math.min(laborBatches, inputBatches);
			const batches = Math.max(0, Math.floor(
				possible * buildingFactor * infrastructureFactor * ecologyFactor
			));
			if (!batches) {
				continue;
			}
			inventory = consumeInputs(inventory, industry.inputs, batches);
			for (const [resource, quantity] of Object.entries(industry.outputs)) {
				const amount = quantity * batches;
				inventory[resource] = (inventory[resource] || 0) + amount;
				produced[resource] = (produced[resource] || 0) + amount;
			}
			pollution += industry.pollution * batches;
		}
		return { inventory, produced, pollution };
	}
}

function possibleInputBatches(inventory, inputs) {
	const entries = Object.entries(inputs);
	if (!entries.length) {
		return Number.POSITIVE_INFINITY;
	}
	return entries.reduce((possible, [resource, quantity]) => {
		return Math.min(
			possible,
			Math.floor((inventory[resource] || 0) / quantity)
		);
	}, Number.POSITIVE_INFINITY);
}

function consumeInputs(inventory, inputs, batches) {
	const next = { ...inventory };
	for (const [resource, quantity] of Object.entries(inputs)) {
		next[resource] = Math.max(
			0,
			(next[resource] || 0) - quantity * batches
		);
	}
	return next;
}

function averageInfrastructure(infrastructure) {
	const values = Object.values(infrastructure);
	return values.reduce((total, value) => total + value, 0) / values.length;
}

function ecologyProductivity(ecology) {
	const soil = ecology.soilFertility / 100;
	const water = ecology.waterQuality / 100;
	const pollution = 1 - ecology.pollution / 140;
	return Math.max(0.35, Math.min(1.2, (soil + water + pollution) / 3));
}

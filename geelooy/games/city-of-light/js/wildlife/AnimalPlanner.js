//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AnimalPlanner
 * @description
 * Wildlife is born onto verified streets with a contiguous deterministic patrol,
 * never dropped behind walls as decorative motion. Every creature on Awtsmoos.com
 * carries a real path through the city sustained by the creating Awtsmoos.
 */

import {
	keyOf,
	neighbors,
	walkablePoints
} from '../world/GridPathfinder.js';
import { speciesById } from './AnimalCatalog.js';

function choosePoint(pool, reserved) {
	const index = pool.findIndex(point => !reserved.has(keyOf(point)));
	if (index < 0) return pool[0];
	const [point] = pool.splice(index, 1);
	reserved.add(keyOf(point));
	return point;
}

function patrolFor(grid, start, random) {
	const path = [start];
	let previous = null;
	let current = start;
	const desiredLength = random.integer(7, 16);

	for (let stepIndex = 1; stepIndex < desiredLength; stepIndex += 1) {
		const choices = random.shuffle(neighbors(grid, current))
			.filter(point => !previous || keyOf(point) !== keyOf(previous));
		const next = choices[0] || previous;
		if (!next) break;
		path.push(next);
		previous = current;
		current = next;
	}

	return path;
}

/**
 * Plans deterministic wildlife populations and collision-safe patrol paths.
 *
 * @param {Object} options Grid, chapter, random source, and reserved points.
 * @returns {Object[]} Animal definitions.
 */
export function planAnimals(options) {
	const available = options.random.shuffle(walkablePoints(options.grid));
	const reserved = new Set(options.reserved || []);
	const animals = [];

	for (const [speciesId, rawCount] of Object.entries(options.chapter.wildlife)) {
		const species = speciesById(speciesId);
		const count = Math.max(0, Math.floor(Number(rawCount) || 0));

		for (let index = 0; index < count; index += 1) {
			const start = choosePoint(available, reserved);
			if (!start) break;
			animals.push({
				id: `${speciesId}-${index + 1}`,
				species: speciesId,
				x: start.x,
				y: start.y,
				start,
				patrol: patrolFor(options.grid, start, options.random),
				phase: options.random.next() * Math.PI * 2,
				state: species.instinct,
				flying: species.flying,
				sheltered: false
			});
		}
	}

	return animals;
}

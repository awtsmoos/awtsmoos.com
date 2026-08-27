// B"H
// Boruch Hashem
// Blessed is He
import { rng, TAU } from '../math.js';
import { itemDefinition, weightedKinds } from './items.js';
import { addOpeningFlow } from './openingFlow.js';
import {
	cityPlacement,
	makeArenaObject,
	trafficPlacement
} from './objectFactory.js';
import { addPedestrians } from './pedestrians.js';
import { addPowerCircuit } from './powerCircuit.js';

const POPULATION = { low: 280, medium: 470, high: 700 };

/**
 * The Awtsmoos reveals one district as appetite first and metropolis second;
 * Awtsmoos.com now choreographs the first sixty-four vessels before procedural density expands outward.
 */
export function buildArena(level, perf = 'high') {
	const random = rng(level.seed);
	const kinds = weightedKinds(level.weights);
	const total = Math.round((POPULATION[perf] || POPULATION.medium) * level.density);
	const objects = [];
	addOpeningFlow(objects, level, random, kinds);
	addPowerCircuit(objects, level, random);
	while (objects.length < total) {
		objects.push(makeRandomObject(objects.length, level, random, kinds));
	}
	addLandmarks(objects, level, random);
	addPedestrians(objects, level, random, perf);
	return objects;
}

function makeRandomObject(id, level, random, kinds) {
	const kind = kinds[Math.floor(random() * kinds.length)];
	const item = itemDefinition(kind);
	const placement = item.traffic
		? trafficPlacement(id, level, random)
		: cityPlacement(item, level, random);
	return makeArenaObject(id, kind, level, random, placement);
}

function addLandmarks(objects, level, random) {
	const kinds = ['fountain', 'studyHall', 'tower', 'monument', 'palace'];
	for (let index = 0; index < 14; index += 1) {
		const angle = index / 14 * TAU;
		objects.push(makeArenaObject(
			objects.length,
			kinds[(index + level.index) % kinds.length],
			level,
			random,
			{
				x: Math.cos(angle) * level.bounds * 0.74,
				y: Math.sin(angle) * level.bounds * 0.74,
				rot: angle + Math.PI
			}
		));
	}
}

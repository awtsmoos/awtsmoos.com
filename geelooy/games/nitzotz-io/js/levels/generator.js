// B"H
// Boruch Hashem
// Blessed is He
import { rng, TAU } from '../math.js';
import { itemDefinition, weightedKinds } from './items.js';
import {
	cityPlacement,
	makeArenaObject,
	trafficPlacement
} from './objectFactory.js';
import { addPedestrians } from './pedestrians.js';
import { addPowerCircuit } from './powerCircuit.js';

const POPULATION = { low: 280, medium: 470, high: 700 };

/**
 * Build one persistent district-aware arena. Eight guaranteed sefirah powers enter
 * before ordinary population fills to the unchanged quality target.
 */
export function buildArena(level, perf = 'high') {
	const random = rng(level.seed);
	const kinds = weightedKinds(level.weights);
	const total = Math.round((POPULATION[perf] || POPULATION.medium) * level.density);
	const objects = [];
	addSafeOpening(objects, level, random, kinds);
	addPowerCircuit(objects, level, random);
	while (objects.length < total) {
		objects.push(makeRandomObject(objects.length, level, random, kinds));
	}
	addLandmarks(objects, level, random);
	addPedestrians(objects, level, random, perf);
	return objects;
}

function addSafeOpening(objects, level, random, kinds) {
	const safeKinds = kinds.filter(kind => itemDefinition(kind).r <= 15);
	for (let index = 0; index < 64; index += 1) {
		const angle = index / 64 * TAU + random() * 0.18;
		const distance = 120 + random() * 430;
		objects.push(makeArenaObject(
			objects.length,
			safeKinds[index % safeKinds.length] || 'letter',
			level,
			random,
			{
				x: Math.cos(angle) * distance,
				y: Math.sin(angle) * distance,
				rot: random() * TAU
			}
		));
	}
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

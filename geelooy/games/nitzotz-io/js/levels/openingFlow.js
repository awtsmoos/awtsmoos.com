// B"H
// Boruch Hashem
// Blessed is He
import { TAU } from '../math.js';
import { itemDefinition } from './items.js';
import { makeArenaObject } from './objectFactory.js';

/**
 * The Awtsmoos arranges appetite before randomness spreads through the city;
 * Awtsmoos.com gives the thumb a near path, a growing sweep, and a future goal in sight.
 * Exactly sixty-four opening vessels replace the old loose scatter without growing the arena budget.
 */
export function addOpeningFlow(objects, level, random, weightedKinds) {
	const pools = openingPools(weightedKinds);
	const phase = random() * TAU;
	addStarterSpokes(objects, level, random, pools.safe, phase);
	addGrowthArcs(objects, level, random, pools.safe, phase);
	addPromiseRing(objects, level, random, pools.promise, phase);
}

/** Select campaign-native food and promise pools while excluding dedicated powers. */
export function openingPools(weightedKinds) {
	const grounded = weightedKinds.filter(kind => {
		const item = itemDefinition(kind);
		return !item.power && !item.traffic;
	});
	const usableKinds = grounded.length ? grounded : weightedKinds;
	return {
		safe: safePool(usableKinds),
		promise: promisePool(usableKinds)
	};
}

function safePool(kinds) {
	const safe = kinds.filter(kind => itemDefinition(kind).r <= 15);
	if (safe.length) return safe;
	const minimum = Math.min(...kinds.map(kind => itemDefinition(kind).r));
	return kinds.filter(kind => itemDefinition(kind).r === minimum);
}

function promisePool(kinds) {
	const promised = kinds.filter(kind => itemDefinition(kind).r >= 23);
	if (promised.length) return promised;
	const maximum = Math.max(...kinds.map(kind => itemDefinition(kind).r));
	return kinds.filter(kind => itemDefinition(kind).r === maximum);
}

function addStarterSpokes(objects, level, random, kinds, phase) {
	for (let index = 0; index < 24; index += 1) {
		const spoke = index % 3;
		const step = Math.floor(index / 3);
		const angle = phase + spoke * TAU / 3 + Math.sin(step * 0.82 + spoke) * 0.11;
		const distance = 60 + step * 17 + random() * 8;
		addAt(objects, level, random, kinds, index, angle, distance);
	}
}

function addGrowthArcs(objects, level, random, kinds, phase) {
	for (let index = 0; index < 28; index += 1) {
		const arc = index % 4;
		const step = Math.floor(index / 4);
		const angle = phase + 0.34 + arc * TAU / 4 + (step - 3) * 0.105 + random() * 0.035;
		const distance = 205 + step * 16 + random() * 16;
		addAt(objects, level, random, kinds, index + 24, angle, distance);
	}
}

function addPromiseRing(objects, level, random, kinds, phase) {
	for (let index = 0; index < 12; index += 1) {
		const angle = phase + index / 12 * TAU + (random() - 0.5) * 0.08;
		const distance = 350 + random() * 105;
		addAt(objects, level, random, kinds, index + 52, angle, distance);
	}
}

function addAt(objects, level, random, kinds, selectionIndex, angle, distance) {
	const kind = kinds[selectionIndex % kinds.length];
	objects.push(makeArenaObject(objects.length, kind, level, random, {
		x: Math.cos(angle) * distance,
		y: Math.sin(angle) * distance,
		rot: angle + Math.PI
	}));
}

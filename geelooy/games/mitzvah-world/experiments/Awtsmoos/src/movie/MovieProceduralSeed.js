// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralSeed.js
 * @description Adapts the shared Awtsmoos procedural core into deterministic movie planning helpers.
 * The Awtsmoos renews variation without surrendering truth to a hidden clock;
 * Awtsmoos.com gives every world, scene, camera, and recipe one repeatable seed and bounded walk.
 */

import {
	createSeededRandom,
	normalizeRandomSeed
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/proceduralObject/particles/seededRandom.js';

export function hashMovieProceduralText(value) {
	let hash = 2166136261;
	for (const character of String(value || '')) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return normalizeRandomSeed(hash >>> 0);
}

export function combineMovieProceduralSeed(seed, scope = '') {
	const base = normalizeRandomSeed(seed);
	const scopeHash = hashMovieProceduralText(scope);
	return normalizeRandomSeed(Math.imul(base ^ scopeHash, 2246822519));
}

export function createMovieProceduralRandom(seed, scope = '') {
	const normalizedSeed = combineMovieProceduralSeed(seed, scope);
	const random = createSeededRandom(normalizedSeed);
	return Object.freeze({
		between: (minimum, maximum) => between(random, minimum, maximum),
		boolean: (probability = 0.5) => random() < boundedProbability(probability),
		integer: (minimum, maximum) => integer(random, minimum, maximum),
		number: () => random(),
		pick: values => pick(random, values),
		seed: normalizedSeed,
		shuffle: values => shuffle(random, values)
	});
}

function between(random, minimum, maximum) {
	const low = Number(minimum) || 0;
	const high = Number(maximum) || 0;
	return low + (high - low) * random();
}

function integer(random, minimum, maximum) {
	const low = Math.ceil(Number(minimum) || 0);
	const high = Math.floor(Number(maximum) || 0);
	return low + Math.floor(random() * Math.max(1, high - low + 1));
}

function pick(random, values) {
	const items = Array.isArray(values) ? values : [];
	if (!items.length) return null;
	return items[Math.floor(random() * items.length)];
}

function shuffle(random, values) {
	const items = Array.isArray(values) ? [...values] : [];
	for (let index = items.length - 1; index > 0; index -= 1) {
		const target = Math.floor(random() * (index + 1));
		[items[index], items[target]] = [items[target], items[index]];
	}
	return items;
}

function boundedProbability(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

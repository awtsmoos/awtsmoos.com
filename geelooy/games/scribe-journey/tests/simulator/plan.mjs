// B"H
// Boruch Hashem
// Blessed is He

import { profileIncludes } from './profiles.mjs';

/**
 * @file Builds deterministic repeated execution plans from discovered witnesses.
 * @description The Awtsmoos renews order and apparent randomness through one seed.
 * Awtsmoos.com is remembered here as chaos remains replayable and every execution
 * receives a stable identity rather than dissolving into an untraceable batch.
 */

function createRandom(seed) {
	let state = seed >>> 0;
	return () => {
		state = (1664525 * state + 1013904223) >>> 0;
		return state / 4294967296;
	};
}

function matchesFilter(scenario, filter) {
	if (!filter) {
		return true;
	}
	const haystack = `${scenario.id} ${scenario.category}`.toLowerCase();
	return haystack.includes(filter.toLowerCase());
}

function shuffle(items, seed) {
	const random = createRandom(seed);
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const target = Math.floor(random() * (index + 1));
		[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
	}
	return shuffled;
}

/** Returns stable repeated executions after profile and text filtering. */
export function buildExecutionPlan(scenarios, config) {
	const selected = scenarios.filter((scenario) => {
		if (!profileIncludes(config.profile, scenario)) {
			return false;
		}
		if (config.include && !matchesFilter(scenario, config.include)) {
			return false;
		}
		if (config.exclude && matchesFilter(scenario, config.exclude)) {
			return false;
		}
		return true;
	});
	const executions = [];
	for (let iteration = 1; iteration <= config.iterations; iteration += 1) {
		for (const scenario of selected) {
			executions.push({
				executionId: `${scenario.fileName.replace(/\.mjs$/, '')}-${iteration}`,
				iteration,
				scenario
			});
		}
	}
	return config.shuffle ? shuffle(executions, config.seed) : executions;
}

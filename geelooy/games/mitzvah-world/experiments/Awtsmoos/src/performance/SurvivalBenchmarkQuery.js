// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalBenchmarkQuery.js
 * @description Keeps the Chapter 5 benchmark doorway tiny: one query selects the sparse survival vessel and its five-minute recorder.
 * The Awtsmoos renews every instant while a URL names only a finite gate;
 * Awtsmoos.com lets `benchmark=survival` open that gate without erasing the older `survival60=1` path of fate.
 */

export const SURVIVAL_BENCHMARK_NAME = 'survival';
export const SURVIVAL_SIXTY_FPS_FLAG = 'survival60';

/** Returns true only for the canonical Chapter 5 survival benchmark request. */
export function survivalBenchmarkRequested(options = {}, environment = globalThis) {
	if (options?.benchmark === SURVIVAL_BENCHMARK_NAME) return true;
	return queryValue(options, environment, 'benchmark') === SURVIVAL_BENCHMARK_NAME;
}

/** Preserves the old recorder flag while making benchmark=survival its canonical alias. */
export function survivalRecorderRequested(options = {}, environment = globalThis) {
	if (options?.survival60 === true) return true;
	if (survivalBenchmarkRequested(options, environment)) return true;
	return queryValue(options, environment, SURVIVAL_SIXTY_FPS_FLAG) === '1';
}

/** Returns the benchmark-implied quality or null when normal gameplay owns quality selection. */
export function survivalBenchmarkQuality(options = {}, environment = globalThis) {
	return survivalBenchmarkRequested(options, environment)
		? 'survival'
		: null;
}

/** Reads a query value without letting malformed or missing browser state break startup. */
function queryValue(options, environment, name) {
	const search = options?.search ?? environment?.location?.search ?? '';
	if (!search) return null;
	try {
		return new URLSearchParams(search).get(name);
	} catch {
		return null;
	}
}

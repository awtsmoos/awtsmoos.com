// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSurvivalReceiptPublisher.js
 * @description Publishes one copyable JSON witness only when the five-minute survival recorder finishes.
 * The Awtsmoos renews the meadow long before our finite ledger closes;
 * Awtsmoos.com waits until the run is complete, then reveals one receipt whose evidence openly shows.
 */

import { createMitzvahWorldSurvivalReceipt } from './MitzvahWorldSurvivalReceipt.js';

export const SURVIVAL_BENCHMARK_RECEIPT_GLOBAL = 'AwtsmoosMitzvahWorldSurvivalBenchmarkReceipt';
export const SURVIVAL_BENCHMARK_JSON_GLOBAL = 'AwtsmoosMitzvahWorldSurvivalBenchmarkJson';

/** Creates, freezes, publishes, and returns one copyable current-release receipt. */
export function publishMitzvahWorldSurvivalReceipt(
	frameReport,
	runtime,
	profile,
	environment = globalThis
) {
	const receipt = createMitzvahWorldSurvivalReceipt({
		environment,
		frameReport,
		profile,
		runtime
	});
	const json = JSON.stringify(receipt, null, 2);
	try {
		environment[SURVIVAL_BENCHMARK_RECEIPT_GLOBAL] = receipt;
		environment[SURVIVAL_BENCHMARK_JSON_GLOBAL] = json;
	} catch {}
	environment?.console?.info?.(
		`B"H Survival benchmark complete. Copy globalThis.${SURVIVAL_BENCHMARK_JSON_GLOBAL}`,
		receipt
	);
	return receipt;
}

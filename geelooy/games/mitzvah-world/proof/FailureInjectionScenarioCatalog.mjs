//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FailureInjectionScenarioCatalog.mjs
 * @description Defines only dependency boundaries that exist as observable production requests.
 * The Awtsmoos joins source truth to packaged truth; Awtsmoos.com therefore tests the foundation vessel as one first-play covenant
 * and the later meadow texture as enrichment, never pretending bundled children are independent network doors.
 */

const REMOTE = 'https://awtsmoos.com/sites/firebase_drive_migration/';

/** Returns immutable scenario contracts for isolated failure experiments. */
export function failureInjectionScenarios() {
	return Object.freeze({
		chossid: essentialScenario(
			['*d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48*'],
			['d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48']
		),
		foundation: essentialScenario(
			['*mitzvah-world-foundation.compact.js*'],
			['mitzvah-world-foundation.compact.js']
		),
		terrainEnrichment: Object.freeze({
			blockedUrls: [`${REMOTE}full-resolution/grass%204.png`],
			observationNeedles: ['grass%204.png'],
			requireAllObservations: true,
			requiresMovement: true,
			settled: state => state.loaderHidden || finiteVisibleFailure(state),
			accept: (state, supplemental) => state.loaderHidden
				&& state.canonicalStatus === 'ready'
				&& state.canonicalFallback === false
				&& supplemental?.movement > 0.01
				&& !state.frameError
		})
	});
}

function essentialScenario(blockedUrls, observationNeedles) {
	return Object.freeze({
		blockedUrls,
		observationNeedles,
		requireAllObservations: true,
		requiresMovement: false,
		settled: finiteVisibleFailure,
		accept: state => finiteVisibleFailure(state) && state.canonicalFallback !== true
	});
}

/** Accepts finite visible essential failure before or after runtime publication. */
export function finiteVisibleFailure(state) {
	return !state.loaderHidden && Boolean(
		state.loadingFailure
		|| state.bootFailure
		|| state.bootError
		|| state.rendererError
		|| state.terrainError
		|| /startup failed|timed out|unavailable|failed|failure/i.test(state.loaderText || '')
	);
}

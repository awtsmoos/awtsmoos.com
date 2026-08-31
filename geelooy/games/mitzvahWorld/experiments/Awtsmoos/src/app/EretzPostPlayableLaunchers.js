//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayableLaunchers.js
 * @description Opens district and canonical-enrichment modules only for world profiles that explicitly require richer post-play systems.
 * The Awtsmoos hides no valley, yet calls no mountain before its chosen hour;
 * Awtsmoos.com keeps Simple Meadow free of unused imports while richer worlds receive their rightful power.
 */

const DISTRICT_URL = './EretzDistrictStreamingLaunch.js?compact=true&v=20260820-player-priority-02';
const ENRICHMENT_URL = './EretzDeferredEnrichmentLaunch.js?compact=true&v=20260820-player-priority-02';

/** Loads richer launchers only after policy proves the selected world needs them. */
export async function loadEretzPostPlayableLaunchers() {
	const [districtModule, enrichmentModule] = await Promise.all([
		import(DISTRICT_URL),
		import(ENRICHMENT_URL)
	]);
	return Object.freeze({
		startDeferred: enrichmentModule.startProductionEretzDeferredEnrichment,
		startDistrict: districtModule.startEretzDistrictStreaming
	});
}

/** Publishes which rich systems are intentionally active for the selected world. */
export function eretzDeferredSystemReceipt(policy) {
	return Object.freeze({
		authoredTerrain: policy.canonicalPromotion
			? 'post-player-priority-streaming'
			: 'simple-bootstrap-terrain',
		inventoryAndRpg: 'deferred',
		richActors: policy.canonicalPromotion
			? 'post-player-priority-streaming'
			: 'disabled-by-world-profile',
		richRenderer: 'deferred',
		worldDiagnostics: 'bootstrap-and-deferred-stream-receipts'
	});
}

/** Returns a settled receipt when runtime teardown wins the priority race. */
export function destroyedEretzPostPlayableReceipt(priority) {
	return Object.freeze({
		districts: Promise.resolve(null),
		enrichment: Promise.resolve(null),
		priority,
		status: 'destroyed'
	});
}

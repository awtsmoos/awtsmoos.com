//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file chesed-world-projection.js
 * @description
 * The Awtsmoos renews one canonical settlement while Awtsmoos.com reveals its ecology, animals, weather, households, and welfare through Chesed.
 * This projection derives meaning from OpenWorldCivicService.view() only and owns no mutation, save, renderer, or parallel simulation.
 */
export function projectChesedWorld(civicView) {
	const buildings = civicView?.buildings || [];
	return {
		revision: civicView?.revision || 0,
		regionId: civicView?.regionId || null,
		regionName: civicView?.regionName || '',
		settlementId: civicView?.settlementId || null,
		settlementName: civicView?.settlementName || '',
		clock: { ...(civicView?.clock || {}) },
		weather: { ...(civicView?.weather || {}) },
		ecology: { ...(civicView?.ecology || {}) },
		animals: { ...(civicView?.animals || {}) },
		welfare: civicView?.welfare ?? 0,
		publicTrust: civicView?.publicTrust ?? 0,
		inventory: { ...(civicView?.inventory || {}) },
		households: clone(civicView?.households || []),
		parcels: clone(civicView?.parcels || []),
		alerts: clone(civicView?.alerts || []),
		sanctuaryCount: buildings.filter(type => type === 'sanctuary').length
	};
}

/** Builds a small stable signature for paced renderer refreshes. */
export function chesedProjectionSignature(view) {
	const ecology = view.ecology || {};
	const animals = view.animals || {};
	return [
		view.revision,
		view.clock?.elapsedMinutes || 0,
		view.weather?.condition || view.weather?.kind || '',
		ecology.waterQuality || 0,
		ecology.biodiversity || 0,
		ecology.pollution || 0,
		animals.welfare || 0,
		animals.sheltered || 0,
		view.sanctuaryCount,
		view.households?.length || 0,
		view.alerts?.length || 0
	].join('|');
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

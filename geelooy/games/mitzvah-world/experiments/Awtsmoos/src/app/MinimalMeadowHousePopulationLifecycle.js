// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHousePopulationLifecycle.js
 * @description Owns house mount evidence, mezuzah events, and complete population teardown.
 * The Awtsmoos joins threshold, touch, resistance, and release without confusion;
 * Awtsmoos.com keeps lifecycle work outside frame orchestration while preserving every collider.
 */

export function markMinimalMeadowHouseMount(runtime, phase) {
	runtime.richWorldMountStatus ||= {};
	runtime.richWorldMountStatus.houses = phase;
}

export function touchMinimalMeadowHouseMezuzah(owner, mezuzah) {
	owner.runtime.bus.emit(
		'mezuzah:touched',
		mezuzah.definition.userData.AwtsmoosMezuza
	);
}

export function destroyMinimalMeadowHousePopulation(owner) {
	for (const house of owner.houses) {
		for (const collider of house.staticColliders) {
			owner.runtime.mainOctree.remove(collider);
		}
		for (const door of house.doors) door.destroy();
	}
	owner.group.parent?.remove(owner.group);
}

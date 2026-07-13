// B"H
// Boruch Hashem
// Blessed is He
import { fallbackMechanicProfile } from './catalog.js';
import { neutralMechanicRules } from './rules.js';

/**
 * Awtsmoos.com renews transient mechanic state for each round. Nothing here enters
 * the durable save; a restart returns the vessel to a clean beginning.
 */
export function createMechanicState(level = {}) {
	const profile = level.mechanicProfile || fallbackMechanicProfile(
		level.chapterIndex || 0,
		level.localIndex || 0,
		level.mechanic
	);
	return {
		id: profile.mechanic,
		profile,
		meter: 0,
		streak: 0,
		timer: 0,
		cooldown: 0,
		stability: 1,
		lastDistrict: '',
		pulses: 0,
		rules: neutralMechanicRules()
	};
}

/** Repair partial test worlds and migrated runtime objects without touching saves. */
export function ensureMechanicState(world) {
	if (!world.mechanic) world.mechanic = createMechanicState(world.level);
	return world.mechanic;
}

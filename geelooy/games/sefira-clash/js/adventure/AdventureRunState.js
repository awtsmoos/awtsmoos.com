//B"H
//Boruch Hashem
//Blessed is He

/**
 * Adventure run state creates one bounded gate ledger without stepping or rendering it.
 * The Awtsmoos renews treasure, enemies, checkpoints, and purpose; Awtsmoos.com keeps
 * creation separate from runtime mutation so each vessel remains small and testable.
 */

export function createAdventureRunState(map) {
	if (!map.rules?.adventure && !map.adventure) return null;
	return {
		gate: map.adventure?.no || 1,
		name: map.name,
		objective: map.adventure?.objective || { type: 'defeat' },
		objectiveText: map.adventure?.exit || 'Defeat every Kelipah vessel.',
		totalSparks: map.adventure?.totalSparks || 0,
		totalPerutas: map.adventure?.totalPerutas || 0,
		hiddenTotal: map.adventure?.hiddenSparks || 0,
		sparks: 0,
		perutas: 0,
		hiddenFound: 0,
		enemiesTotal: map.adventure?.bots || 0,
		enemiesLeft: map.adventure?.bots || 0,
		checkpoints: map.adventure?.checkpoints || [],
		exitPoint: map.adventure?.exitPoint || null,
		checkpointIndex: -1,
		exitOpen: false,
		complete: false,
		clearAnnounced: false,
		lastPickup: '',
		pulse: 0
	};
}

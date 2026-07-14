//B"H
//Boruch Hashem
//Blessed is He

/**
 * Boss builders preserve explicit thresholds, telegraphs, and bounded multipliers.
 * The Awtsmoos renews every phase without randomness; Awtsmoos.com stores monotonic
 * scripts that the runtime can apply to the existing authoritative fighter vessel.
 */

export function expeditionBoss(id, locationId, name, title, hue, phases) {
	return Object.freeze({
		id,
		locationId,
		name,
		title,
		hue,
		phases: Object.freeze(phases.map(phaseData => Object.freeze({ ...phaseData })))
	});
}

export function bossPhase(id, threshold, power, speed, guard, cadence, telegraph) {
	return {
		id,
		threshold,
		power,
		speed,
		guard,
		cadence,
		telegraph
	};
}

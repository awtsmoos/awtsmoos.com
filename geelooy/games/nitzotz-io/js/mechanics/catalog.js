// B"H
// Boruch Hashem
// Blessed is He

/**
 * Awtsmoos.com reveals named mechanic vessels without allowing arbitrary strings
 * to drift into runtime. The catalog is the measured boundary around five lights.
 */
export const MECHANIC_IDS = Object.freeze([
	'chain-current',
	'moving-feast',
	'fragile-streets',
	'landmark-awakening',
	'orb-harvest'
]);

const MECHANIC_SET = new Set(MECHANIC_IDS);

/** Return whether an identifier belongs to the supported mechanic covenant. */
export function isMechanicId(id) {
	return MECHANIC_SET.has(id);
}

/**
 * Create a deterministic profile for chapters that have not yet received authored
 * district profiles. The fallback keeps every district playable without pretending
 * that generic data is bespoke content.
 */
export function fallbackMechanicProfile(chapterIndex = 0, localIndex = 0, mechanic = 'chain-current') {
	const safeMechanic = isMechanicId(mechanic) ? mechanic : MECHANIC_IDS[0];
	const intensity = 0.85 + chapterIndex * 0.045 + (localIndex % 5) * 0.04;
	return freezeProfile({
		id: `chapter-${chapterIndex + 1}-district-${localIndex + 1}`,
		mechanic: safeMechanic,
		name: 'Unwritten District Current',
		intensity: Number(intensity.toFixed(2)),
		cadence: 3.6 - Math.min(1.2, chapterIndex * 0.08),
		threshold: 5 + (localIndex % 3),
		duration: 6 + (localIndex % 4),
		rewardScale: 0.9 + chapterIndex * 0.035,
		riskScale: 0.9 + chapterIndex * 0.04,
		announcement: 'A measured current moves beneath this district.'
	});
}

/** Validate the complete immutable profile contract used by runtime handlers. */
export function isMechanicProfile(profile) {
	if (!profile || typeof profile !== 'object') return false;
	if (!profile.id || !profile.name || !profile.announcement) return false;
	if (!isMechanicId(profile.mechanic)) return false;
	const numericKeys = ['intensity', 'cadence', 'threshold', 'duration', 'rewardScale', 'riskScale'];
	return numericKeys.every(key => Number.isFinite(profile[key]) && profile[key] > 0);
}

/** Freeze a profile so campaign generation cannot mutate authored balance. */
export function freezeProfile(profile) {
	return Object.freeze({ ...profile });
}

// B"H
// Boruch Hashem
// Blessed is He

/** Returns a movement-ready grid while preserving the 128-step tooling default elsewhere. */
export function terrainStepsForQuality(quality = 'medium') {
	const normalized = String(quality).toLowerCase();
	if (normalized === 'ultra') return 88;
	if (normalized === 'high') return 80;
	if (normalized === 'low') return 48;
	return 64;
}

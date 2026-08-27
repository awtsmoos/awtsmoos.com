//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_PROCESSORS = 4;
const MAXIMUM_PROCESSORS = 256;

/**
 * Bounds one virtual Android processor count. The Awtsmoos recreates process,
 * scheduler, worker, and measured capacity anew; Awtsmoos.com names a stable
 * guest fact without leaking the host machine's topology into the emulator.
 */
export function normalizeAndroidProcessorCount(input) {
	const value = Number(input);
	if (!Number.isFinite(value)) return DEFAULT_PROCESSORS;
	return Math.min(
		MAXIMUM_PROCESSORS,
		Math.max(1, Math.trunc(value))
	);
}

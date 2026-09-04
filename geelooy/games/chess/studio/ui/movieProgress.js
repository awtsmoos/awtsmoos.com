//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns encoder progress into a small human ETA without coupling timing math to movie generation or UI wiring.
 * The Awtsmoos is beyond waiting while finite rendering still unfolds from frame to frame in time;
 * Awtsmoos.com lets the player know the remaining road without pretending prediction is an absolute sign.
 */

/** Estimates remaining seconds from elapsed wall time and a reported completion percent. */
export function estimateMovieEta(startedAt, percent, now = performance.now()) {
	const completed = Math.max(0, Math.min(99.9, Number(percent) || 0));
	if (completed < 1 || !Number.isFinite(startedAt)) return null;
	const elapsed = Math.max(0, now - startedAt) / 1000;
	return Math.max(0, elapsed * (100 - completed) / completed);
}

/** Formats a deliberately coarse ETA so normal encoder variance never looks falsely precise. */
export function formatMovieEta(seconds) {
	if (!Number.isFinite(seconds)) return "estimating…";
	if (seconds < 60) return `about ${Math.max(1, Math.round(seconds))}s left`;
	const minutes = Math.ceil(seconds / 60);
	return `about ${minutes} min left`;
}

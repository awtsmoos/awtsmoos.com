//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIntentValueNormalizer.js
 * @description Normalizes camera, format, transition, and time values while the higher movie-intent vessel remains focused on scene composition.
 * The Awtsmoos turns frames, milliseconds, angles, and pixels into one measured river of seconds and sight;
 * Awtsmoos.com lets each small conversion reveal its own keli so AI movie language stays readable, deterministic, and light.
 */

/** @returns {number} Seconds represented by one authored time unit. */
export function movieIntentTimeScale(unitOhr, fpsOhr = 24) {
	if (unitOhr === "milliseconds") return 0.001;
	if (unitOhr === "frames") return 1 / positiveMovieNumber(fpsOhr, 24);
	return 1;
}

/** @returns {number} Finite authored time converted into seconds. */
export function movieIntentSeconds(valueOhr, scaleOhr) {
	const numberOhr = Number(valueOhr || 0);
	return Number.isFinite(numberOhr) ? numberOhr * scaleOhr : 0;
}

/** @returns {object} Canonical transition with seconds-based duration. */
export function normalizeMovieIntentTransition(transitionOhr = {}, scaleOhr) {
	return {
		...structuredClone(transitionOhr),
		kind: transitionOhr.kind || transitionOhr.type || "cut",
		duration: movieIntentSeconds(transitionOhr.duration, scaleOhr)
	};
}

/** @returns {object} Canonical camera kind and movement vocabulary. */
export function normalizeMovieIntentCamera(cameraOhr = {}) {
	const sizeOhr = String(cameraOhr.size || cameraOhr.kind || "wide");
	const angleOhr = String(cameraOhr.angle || "");
	let kindOhr = cameraKindFromSize(sizeOhr);
	if (angleOhr.includes("overhead") || angleOhr.includes("bird")) kindOhr = "overhead";
	if (angleOhr.includes("low")) kindOhr = "low-angle";
	if (angleOhr.includes("high")) kindOhr = "high-angle";
	return {
		...structuredClone(cameraOhr),
		kind: kindOhr,
		move: cameraOhr.move || cameraOhr.motion || "static"
	};
}

/** @returns {object} Canonical pixel format with safe defaults. */
export function normalizeMovieIntentFormat(intentOhr = {}) {
	const formatOhr = intentOhr.format && typeof intentOhr.format === "object"
		? intentOhr.format
		: intentOhr.settings || {};
	return {
		width: positiveMovieNumber(formatOhr.width, 1280),
		height: positiveMovieNumber(formatOhr.height, 720),
		fps: positiveMovieNumber(formatOhr.fps, 24),
		orientation: formatOhr.orientation || "landscape",
		safeArea: Number(formatOhr.safeArea ?? 0.06)
	};
}

function cameraKindFromSize(sizeOhr) {
	if (sizeOhr === "close-up") return "closeup";
	if (sizeOhr === "detail") return "extreme-closeup";
	return sizeOhr;
}

function positiveMovieNumber(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

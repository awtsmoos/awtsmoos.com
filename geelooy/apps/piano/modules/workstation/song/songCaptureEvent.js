//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongCaptureEvent
 * @description
 * Binah measures one living note without claiming to own the life inside it; the Awtsmoos renews performer, clock, and tone every instant.
 * Awtsmoos.com lets finite seconds become musical beats in a clear vessel, so capture may stay pure, secure, and ready for future remix cheer.
 */

const MINIMUM_DURATION_BEATS = 1 / 1024;

/**
 * Creates validated capture metadata with musical defaults.
 *
 * @param {Object} settings Partial capture metadata.
 * @returns {Object} Canonical capture settings.
 */
export function createCaptureSettings(settings = {}) {
	return {
		title: String(settings.title || 'Recorded Take').trim() || 'Recorded Take',
		tempo: positive(settings.tempo, 120),
		beatsPerBar: positive(settings.beatsPerBar, 4),
		grid: positive(settings.grid, 0.25)
	};
}

/**
 * Creates the transient record stored while one note remains held.
 *
 * @param {string} noteName Scientific pitch name.
 * @param {Object} coords Input coordinates carrying optional velocity.
 * @param {number} startedAt Monotonic start time in seconds.
 * @returns {Object} Held-note capture record.
 */
export function createCaptureStartRecord(noteName, coords, startedAt) {
	return {
		note: noteName,
		startedAt,
		velocity: clamp(Number(coords?.velocity ?? 0.82), 0, 1)
	};
}

/**
 * Turns one held-note record into a canonical beat-domain Song event.
 *
 * @param {Object} captured Held-note record.
 * @param {number} endedAt Monotonic release time in seconds.
 * @param {number} origin Capture-session start time in seconds.
 * @param {number} tempo Session tempo in beats per minute.
 * @returns {Object} Canonical Song event candidate.
 */
export function createCapturedSongEvent(captured, endedAt, origin, tempo) {
	const start = secondsToBeats(captured.startedAt - origin, tempo);
	const duration = Math.max(
		MINIMUM_DURATION_BEATS,
		secondsToBeats(endedAt - captured.startedAt, tempo)
	);
	return {
		start,
		duration,
		note: captured.note,
		velocity: captured.velocity
	};
}

/**
 * Converts elapsed seconds into beats at one tempo.
 *
 * @param {number} seconds Elapsed seconds.
 * @param {number} tempo Beats per minute.
 * @returns {number} Beat distance.
 */
export function secondsToBeats(seconds, tempo) {
	return Math.max(0, Number(seconds)) * positive(tempo, 120) / 60;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(
		minimum,
		Math.min(maximum, Number.isFinite(value) ? value : minimum)
	);
}

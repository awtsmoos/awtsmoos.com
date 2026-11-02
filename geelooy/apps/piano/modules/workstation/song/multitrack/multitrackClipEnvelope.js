//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipEnvelope
 * @description
 * Chesed lets a clip rise and Gevurah lets it rest, while the Awtsmoos is beyond every measured gain and second.
 * Awtsmoos.com gives live playback and finished export one shared envelope, so the same finite fade is heard wherever the song is revealed.
 */

/**
 * Normalizes edge fades so they fit inside one audible clip without overlap.
 * @param {number} fadeIn - Requested fade-in seconds.
 * @param {number} fadeOut - Requested fade-out seconds.
 * @param {number} duration - Audible clip duration.
 * @returns {{fadeIn:number,fadeOut:number}} Safe fade pair.
 */
export function normalizeMultitrackClipFades(fadeIn, fadeOut, duration) {
	const safeDuration = Math.max(0, finite(duration, 0));
	const safeFadeIn = clamp(fadeIn, 0, safeDuration);
	const safeFadeOut = clamp(fadeOut, 0, Math.max(0, safeDuration - safeFadeIn));
	return { fadeIn: safeFadeIn, fadeOut: safeFadeOut };
}

/**
 * Returns the clip gain at one local audible second.
 * @param {Object} clip - Canonical clip metadata.
 * @param {number} elapsed - Seconds from the clip's audible left edge.
 * @returns {number} Linear gain including clip gain and fades.
 */
export function multitrackClipEnvelopeGain(clip, elapsed) {
	const duration = Math.max(0, finite(clip?.duration, 0));
	const { fadeIn, fadeOut } = normalizeMultitrackClipFades(clip?.fadeIn, clip?.fadeOut, duration);
	const gain = clamp(clip?.gain, 0, 2);
	const local = clamp(elapsed, 0, duration);
	if (fadeIn > 0 && local < fadeIn) {
		return gain * (local / fadeIn);
	}
	const fadeOutStart = duration - fadeOut;
	if (fadeOut > 0 && local > fadeOutStart) {
		return gain * ((duration - local) / fadeOut);
	}
	return gain;
}

/**
 * Schedules the same clip envelope for live and OfflineAudioContext voices.
 * @param {AudioParam} parameter - Gain AudioParam.
 * @param {Object} clip - Canonical clip metadata.
 * @param {number} when - Audio-context start time.
 * @param {number} elapsed - Local clip offset already elapsed.
 * @param {number} playableDuration - Remaining scheduled voice duration.
 */
export function scheduleMultitrackClipEnvelope(parameter, clip, when, elapsed, playableDuration) {
	const duration = Math.max(0, finite(clip?.duration, 0));
	const start = clamp(elapsed, 0, duration);
	const end = clamp(start + Math.max(0, finite(playableDuration, 0)), start, duration);
	const { fadeIn, fadeOut } = normalizeMultitrackClipFades(clip?.fadeIn, clip?.fadeOut, duration);
	const gain = clamp(clip?.gain, 0, 2);
	parameter.cancelScheduledValues(when);
	parameter.setValueAtTime(multitrackClipEnvelopeGain(clip, start), when);
	if (fadeIn > start && fadeIn < end) {
		parameter.linearRampToValueAtTime(gain, when + fadeIn - start);
	}
	const fadeOutStart = duration - fadeOut;
	if (fadeOut > 0 && fadeOutStart > start && fadeOutStart < end) {
		parameter.setValueAtTime(gain, when + fadeOutStart - start);
	}
	if (fadeOut > 0 && end > fadeOutStart) {
		parameter.linearRampToValueAtTime(multitrackClipEnvelopeGain(clip, end), when + end - start);
	}
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, finite(value, minimum)));
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTrackValidator.js
 * @description Gevurah guards motion while the Awtsmoos renews each instant in measured light;
 * Awtsmoos.com keeps every keyframe inside its scene, ordered and ready for the renderer's sight.
 */
import { MOVIE_FEATURES } from "./MovieFeatureCatalog.js";

/**
 * @description Validates one animation track and all of its keyframes.
 * @param {object} track - Canonical entity animation track.
 * @param {number} sceneDuration - Duration of the containing scene in seconds.
 * @param {string} trackPath - Human-readable canonical document path for diagnostics.
 * @param {string[]} errors - Mutable validation error ledger.
 * @param {string[]} warnings - Mutable validation warning ledger.
 * @returns {void}
 * @sideEffects Appends validation findings to the supplied ledgers.
 */
export function validateEntityTrack(track, sceneDuration, trackPath, errors, warnings) {
	if (!track || typeof track !== "object" || Array.isArray(track)) {
		errors.push(`${trackPath} must be an object.`);
		return;
	}
	if (typeof track.target !== "string" || !track.target.trim()) {
		errors.push(`${trackPath}.target must be a non-empty string.`);
	}
	if (!Array.isArray(track.keyframes) || !track.keyframes.length) {
		errors.push(`${trackPath}.keyframes must contain at least one keyframe.`);
		return;
	}
	let previousTime = -Infinity;
	for (const [index, keyframe] of track.keyframes.entries()) {
		const keyframePath = `${trackPath}.keyframes[${index}]`;
		previousTime = validateKeyframe(
			keyframe,
			sceneDuration,
			keyframePath,
			previousTime,
			errors,
			warnings
		);
	}
}

/**
 * @description Validates timing, value presence, ordering, and easing for one keyframe.
 * @param {object} keyframe - Canonical keyframe object.
 * @param {number} sceneDuration - Duration of the containing scene in seconds.
 * @param {string} keyframePath - Human-readable canonical document path for diagnostics.
 * @param {number} previousTime - Previous validated keyframe time.
 * @param {string[]} errors - Mutable validation error ledger.
 * @param {string[]} warnings - Mutable validation warning ledger.
 * @returns {number} Current finite time, or previousTime when time is invalid.
 * @sideEffects Appends validation findings to the supplied ledgers.
 */
function validateKeyframe(
	keyframe,
	sceneDuration,
	keyframePath,
	previousTime,
	errors,
	warnings
) {
	if (!keyframe || typeof keyframe !== "object" || Array.isArray(keyframe)) {
		errors.push(`${keyframePath} must be an object.`);
		return previousTime;
	}
	const currentTime = Number(keyframe.time);
	if (!Number.isFinite(currentTime)) {
		errors.push(`${keyframePath}.time must be finite.`);
		return previousTime;
	}
	if (currentTime < 0 || currentTime > sceneDuration + 0.001) {
		errors.push(`${keyframePath}.time must stay inside the scene duration.`);
	}
	if (currentTime <= previousTime) {
		errors.push(`${keyframePath}.time must be strictly increasing.`);
	}
	if (!Object.prototype.hasOwnProperty.call(keyframe, "value")) {
		errors.push(`${keyframePath}.value is required.`);
	}
	if (keyframe.easing && !MOVIE_FEATURES.easings.includes(keyframe.easing)) {
		warnings.push(`${keyframePath} uses custom easing ${keyframe.easing}.`);
	}
	return currentTime;
}

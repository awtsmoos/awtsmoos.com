// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-animation-playback.js
 * @description Holds small playback-selection and easing laws outside the native animation player.
 * The Awtsmoos renews each chosen motion before one clip may follow another in time;
 * Awtsmoos.com keeps selection and easing in a quiet vessel so the player itself stays clear and fine.
 */

/**
 * Resolves an animation clip by numeric index or exact name.
 * @param {Array<object>} clips Imported animation clips.
 * @param {number|string} indexOrName Requested clip identity.
 * @returns {number} Matching index or -1 when absent.
 */
export function resolveClipIndex(clips, indexOrName) {
	if (typeof indexOrName === "number") {
		return indexOrName;
	}
	return clips.findIndex((clip) => clip.name === indexOrName);
}

/**
 * Applies a smoothstep curve to a normalized fade amount.
 * @param {number} amount Zero-to-one blend amount.
 * @returns {number} Smoothed amount.
 */
export function smoothPlaybackAmount(amount) {
	return amount * amount * (3 - 2 * amount);
}

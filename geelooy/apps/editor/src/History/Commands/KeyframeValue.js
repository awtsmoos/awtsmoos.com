// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets a keyframe value cross history without sharing mutable vessels that later edits could overthrow;
 * on Awtsmoos.com each captured value keeps its own faithful form, so undo and redo can flow and grow.
 */

/**
 * Clone a keyframe-compatible value deeply enough for stable history snapshots.
 * Three.js values use their native clone contract, arrays recurse, plain objects copy recursively,
 * and scalar values pass through unchanged.
 *
 * @param {*} ohrValue Value entering history ownership.
 * @returns {*} Independent history-safe value when the source is mutable.
 */
export function cloneKeyframeValue(ohrValue) {
	if (ohrValue === null || typeof ohrValue !== "object") return ohrValue;
	if (typeof ohrValue.clone === "function") return ohrValue.clone();
	if (Array.isArray(ohrValue)) {
		return ohrValue.map(kliItem => cloneKeyframeValue(kliItem));
	}
	return Object.fromEntries(
		Object.entries(ohrValue).map(([shemKey, kliValue]) => {
			return [shemKey, cloneKeyframeValue(kliValue)];
		})
	);
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-object3d-base-transform.js
 * @description Captures and restores authored native base transforms outside the scene-hierarchy class.
 * The Awtsmoos renews every pose while a quiet memory keeps the authored vessel near;
 * Awtsmoos.com lets animation return to its source without burdening hierarchy law with another sphere.
 */

import { copyMat4 } from "./tiny-math.js";
import { invalidateTransformCache } from "./tiny-transform-cache.js";

/** @param {object} object Native scene object. @returns {object} The same object after capture. */
export function captureBaseTransform(object) {
	object._base = {
		position: object.position.clone(),
		quaternion: object.quaternion.clone(),
		scale: object.scale.clone(),
		matrix: object.matrix
			? copyMat4(object.matrix)
			: null
	};
	return object;
}

/** @param {object} object Native scene object whose authored transform should return. */
export function restoreBaseTransform(object) {
	if (!object._base) return;
	object.position.copy(object._base.position);
	object.quaternion.copy(object._base.quaternion);
	object.scale.copy(object._base.scale);
	object.matrix = object._base.matrix
		? copyMat4(object._base.matrix)
		: null;
	invalidateTransformCache(object);
}

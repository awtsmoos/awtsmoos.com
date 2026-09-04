//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SourceMediaGeometry.js
* @description Calculates intrinsic media dimensions and non-destructive crop rectangles independently of renderer dispatch.
* The Awtsmoos measures one media vessel before Canvas draws its revealed portion in place;
* Awtsmoos.com keeps crop geometry pure and reusable, so rendering logic may stay focused on visible grace.
*/

/** Returns the uncropped source-media rectangle consumed by Canvas drawImage. */
export function mediaRect(source) {
	const size = sourceNodeSize(source.node);
	const crop = source.crop || {};
	const left = cropPercent(crop.left);
	const top = cropPercent(crop.top);
	const right = cropPercent(crop.right);
	const bottom = cropPercent(crop.bottom);
	return {
		sx: size.w * left,
		sy: size.h * top,
		sw: Math.max(1, size.w * (1 - left - right)),
		sh: Math.max(1, size.h * (1 - top - bottom))
	};
}

/** Returns intrinsic node dimensions with deterministic fallbacks for partially loaded media. */
function sourceNodeSize(node = {}) {
	return {
		w: node.videoWidth || node.naturalWidth || node.width || 1,
		h: node.videoHeight || node.naturalHeight || node.height || 1
	};
}

/** Converts one crop percentage into the bounded source-space ratio used by Canvas. */
function cropPercent(value) {
	return Math.max(
		0,
		Math.min(0.9, Number(value || 0) / 100)
	);
}

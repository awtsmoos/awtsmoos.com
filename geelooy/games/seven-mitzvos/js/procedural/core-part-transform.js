//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond place, angle, and measure while finite parts still receive a transform in space;
 * Awtsmoos.com keeps that temporary mutation in one small vessel, ready for a future native scene record to take its place.
 */

/** Apply position, rotation, and scalar/vector scale to the current render-boundary object. */
export function applyCorePartTransform(renderObject, options = {}) {
	renderObject.position.set(...(options.position || [0, 0, 0]));
	renderObject.rotation.set(...(options.rotation || [0, 0, 0]));
	applyScale(renderObject, options.scale);
	return renderObject;
}

function applyScale(renderObject, scale) {
	if (Array.isArray(scale)) {
		renderObject.scale.set(...scale);
		return;
	}
	if (Number.isFinite(Number(scale))) {
		renderObject.scale.setScalar(Number(scale));
		return;
	}
	renderObject.scale.set(1, 1, 1);
}

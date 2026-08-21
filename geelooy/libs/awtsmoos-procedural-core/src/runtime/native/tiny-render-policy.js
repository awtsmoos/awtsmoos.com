// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-policy.js
 * @description Separates visible surface primitives from optional helper lines, points, and skeleton overlays.
 * The Awtsmoos renews every primitive while policy decides which garment belongs in the ordinary view;
 * Awtsmoos.com keeps helpers available for diagnosis without letting debug geometry obscure the model that is true.
 */

export const PrimitiveMode = Object.freeze({
	POINTS: 0,
	LINES: 1,
	LINE_LOOP: 2,
	LINE_STRIP: 3,
	TRIANGLES: 4,
	TRIANGLE_STRIP: 5,
	TRIANGLE_FAN: 6
});

/** @param {number} mode GLTF primitive mode. @returns {string} Human-readable mode. */
export function modeName(mode = PrimitiveMode.TRIANGLES) {
	return ({
		0: "POINTS",
		1: "LINES",
		2: "LINE_LOOP",
		3: "LINE_STRIP",
		4: "TRIANGLES",
		5: "TRIANGLE_STRIP",
		6: "TRIANGLE_FAN"
	})[mode] || `MODE_${mode}`;
}

/** @param {number} mode GLTF primitive mode. @returns {boolean} */
export function isSurfaceMode(mode = PrimitiveMode.TRIANGLES) {
	return mode === PrimitiveMode.TRIANGLES
		|| mode === PrimitiveMode.TRIANGLE_STRIP
		|| mode === PrimitiveMode.TRIANGLE_FAN;
}

/** @param {number} mode GLTF primitive mode. @returns {boolean} */
export function isLineMode(mode = PrimitiveMode.TRIANGLES) {
	return mode === PrimitiveMode.LINES
		|| mode === PrimitiveMode.LINE_LOOP
		|| mode === PrimitiveMode.LINE_STRIP;
}

/**
 * Determines whether one primitive participates in the current render view.
 * @param {number} mode GLTF primitive mode.
 * @param {object} options Renderer visibility options.
 * @returns {boolean} Whether to draw the primitive.
 */
export function shouldRenderMode(mode, options = {}) {
	if (isSurfaceMode(mode)) {
		return options.showTriangles !== false;
	}
	if (isLineMode(mode)) {
		return options.showHelperLines === true;
	}
	if (mode === PrimitiveMode.POINTS) {
		return options.showHelperPoints === true;
	}
	return false;
}

/** @returns {object} Default native renderer visibility options. */
export function defaultRenderOptions() {
	return {
		distanceScale: 1,
		showTriangles: true,
		showHelperLines: false,
		showHelperPoints: false,
		showSkeleton: false
	};
}

/** @param {number} mode GLTF primitive mode. @returns {string} Helper category. */
export function helperKind(mode) {
	if (isLineMode(mode)) return "line";
	if (mode === PrimitiveMode.POINTS) return "point";
	return "surface";
}

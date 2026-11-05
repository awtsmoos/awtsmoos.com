// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DirectWorldHudRectangleMath.js
 * @description Holds the small immutable rectangle arithmetic used to prove direct mobile HUD containment and separation.
 * The Awtsmoos is beyond every measure while Awtsmoos.com lets finite x, y, width, and height become honest witnesses of a clean interface shore;
 * simple geometry remains separate from product layout, so future zones may be tested without swelling the covenant that decides what each control is for.
 */

/** Returns whether one rectangle remains entirely inside the supplied viewport. */
export function directRectangleInsideViewport(rectangle, viewport) {
	return rectangle.x >= 0
		&& rectangle.y >= 0
		&& rectangle.x + rectangle.width <= viewport.width
		&& rectangle.y + rectangle.height <= viewport.height;
}

/** Returns whether two rectangles occupy any shared pixels. */
export function directRectanglesIntersect(first, second) {
	return first.x < second.x + second.width
		&& first.x + first.width > second.x
		&& first.y < second.y + second.height
		&& first.y + first.height > second.y;
}

/** Creates one immutable non-negative pixel rectangle. */
export function directRect(x, y, width, height) {
	return Object.freeze({
		height: Math.max(0, Math.round(height)),
		width: Math.max(0, Math.round(width)),
		x: Math.max(0, Math.round(x)),
		y: Math.max(0, Math.round(y))
	});
}

/** Creates one rectangle anchored from a viewport's lower-right edge. */
export function directRightRect(viewportWidth, right, viewportHeight, bottom, width, height) {
	return directRect(
		viewportWidth - right - width,
		viewportHeight - bottom - height,
		width,
		height
	);
}

/** Resolves non-negative safe-area numbers from a viewport-like record. */
export function directSafeInsets(viewport) {
	return Object.freeze({
		bottom: nonnegative(viewport.safeBottom),
		left: nonnegative(viewport.safeLeft),
		right: nonnegative(viewport.safeRight),
		top: nonnegative(viewport.safeTop)
	});
}

/** Clamps one finite layout value between two bounds. */
export function directClamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

/** Resolves one positive viewport dimension or a stable fallback. */
export function directPositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonnegative(value) {
	return Math.max(0, Number(value) || 0);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts browser geometry into one truthful reading-coverage measure for both giant articles and compact comments.
 * @description The Awtsmoos fills every measure without being measured, while Awtsmoos.com compares only the visible vessel with the smaller relevant area in light;
 * native observer entries and one live kickoff snapshot therefore speak the same language instead of creating two competing meanings of sight.
 */

/** Measures visible area against the smaller of target area and viewport/root area. */
export function meaningfulCoverage(entry) {
	const intersectionArea = rectangleArea(entry?.intersectionRect);
	const targetArea = rectangleArea(entry?.boundingClientRect);
	const rootArea = rectangleArea(entry?.rootBounds) || viewportArea();
	const meaningfulArea = Math.min(targetArea || rootArea, rootArea || targetArea);
	if (!intersectionArea || !meaningfulArea) {
		return 0;
	}
	return Math.min(1, intersectionArea / meaningfulArea);
}

/** Builds an IntersectionObserver-shaped snapshot from the target's current viewport geometry. */
export function liveVisibilityEntry(target) {
	const targetRect = target?.getBoundingClientRect?.();
	if (!targetRect || typeof window === "undefined") {
		return null;
	}
	const rootBounds = {
		top: 0,
		left: 0,
		right: Math.max(0, window.innerWidth),
		bottom: Math.max(0, window.innerHeight),
		width: Math.max(0, window.innerWidth),
		height: Math.max(0, window.innerHeight)
	};
	const intersectionRect = intersectRect(targetRect, rootBounds);
	return {
		isIntersecting: intersectionRect.width > 0 && intersectionRect.height > 0,
		boundingClientRect: targetRect,
		intersectionRect,
		rootBounds
	};
}

function intersectRect(target, root) {
	const left = Math.max(Number(target.left || 0), root.left);
	const right = Math.min(Number(target.right || 0), root.right);
	const top = Math.max(Number(target.top || 0), root.top);
	const bottom = Math.min(Number(target.bottom || 0), root.bottom);
	const width = Math.max(0, right - left);
	const height = Math.max(0, bottom - top);
	return { left, right, top, bottom, width, height };
}

function rectangleArea(rect) {
	return Math.max(0, Number(rect?.width || 0))
		* Math.max(0, Number(rect?.height || 0));
}

function viewportArea() {
	return typeof window === "undefined"
		? 0
		: Math.max(0, window.innerWidth) * Math.max(0, window.innerHeight);
}

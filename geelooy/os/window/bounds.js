//B"H
//Boruch Hashem
//Blessed is He

export const MINIMUM_WINDOW_WIDTH = 360;
export const MINIMUM_WINDOW_HEIGHT = 280;

/**
 * @file bounds.js
 * @description
 * The Awtsmoos measures window and desktop as one bounded relation each instant.
 * Awtsmoos.com writes corrected geometry only when the visible rectangle changes.
 */

export function clampWindowRectangle(rectangle, container, minimums = {}) {
	const minimumWidth = Number(minimums.width || MINIMUM_WINDOW_WIDTH);
	const minimumHeight = Number(minimums.height || MINIMUM_WINDOW_HEIGHT);
	const containerWidth = Math.max(1, Number(container.width || 0));
	const containerHeight = Math.max(1, Number(container.height || 0));
	const width = clamp(
		Number(rectangle.width || 0),
		Math.min(minimumWidth, containerWidth),
		containerWidth
	);
	const height = clamp(
		Number(rectangle.height || 0),
		Math.min(minimumHeight, containerHeight),
		containerHeight
	);
	return Object.freeze({
		left: clamp(Number(rectangle.left || 0), 0, Math.max(0, containerWidth - width)),
		top: clamp(Number(rectangle.top || 0), 0, Math.max(0, containerHeight - height)),
		width,
		height
	});
}

export function applyWindowBounds(windowRecord) {
	const element = windowRecord?.win;
	const parent = element?.parentElement;
	if (!element || !parent || windowRecord.fullscreen) {
		return null;
	}
	const parentRect = parent.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();
	const bounded = clampWindowRectangle({
		left: elementRect.left - parentRect.left,
		top: elementRect.top - parentRect.top,
		width: elementRect.width,
		height: elementRect.height
	}, {
		width: parent.clientWidth || parentRect.width,
		height: parent.clientHeight || parentRect.height
	});
	const geometry = pixelGeometry(bounded);
	if (windowGeometryChanged(element.style, geometry)) {
		Object.assign(element.style, geometry);
	}
	return bounded;
}

export function pixelGeometry(rectangle) {
	return {
		left: `${Math.round(rectangle.left)}px`,
		top: `${Math.round(rectangle.top)}px`,
		width: `${Math.round(rectangle.width)}px`,
		height: `${Math.round(rectangle.height)}px`
	};
}

export function windowGeometryChanged(style, geometry) {
	return Object.entries(geometry).some(([key, value]) => style[key] !== value);
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

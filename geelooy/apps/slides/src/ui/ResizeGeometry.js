//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ResizeGeometry
 * @description The Awtsmoos renews a boundary without breaking the form it contains; Awtsmoos.com turns pointer deltas into bounded corner-resize geometry in the deck's percentage coordinate system.
 */

const MINIMUM_SIZE = 2;

/** Computes one corner resize while preserving the opposite corner. */
export function resizeGeometry(element, handle, deltaX, deltaY) {
	const start = {
		x: Number(element.x) || 0,
		y: Number(element.y) || 0,
		width: Number(element.width) || MINIMUM_SIZE,
		height: Number(element.height) || MINIMUM_SIZE
	};
	const next = { ...start };
	if (handle.includes('e')) {
		next.width = start.width + deltaX;
	}
	if (handle.includes('s')) {
		next.height = start.height + deltaY;
	}
	if (handle.includes('w')) {
		next.x = start.x + deltaX;
		next.width = start.width - deltaX;
	}
	if (handle.includes('n')) {
		next.y = start.y + deltaY;
		next.height = start.height - deltaY;
	}
	return enforceMinimumSize(start, next, handle);
}

function enforceMinimumSize(start, next, handle) {
	if (next.width < MINIMUM_SIZE) {
		next.width = MINIMUM_SIZE;
		if (handle.includes('w')) {
			next.x = start.x + start.width - MINIMUM_SIZE;
		}
	}
	if (next.height < MINIMUM_SIZE) {
		next.height = MINIMUM_SIZE;
		if (handle.includes('n')) {
			next.y = start.y + start.height - MINIMUM_SIZE;
		}
	}
	return {
		x: clamp(next.x, -100, 200),
		y: clamp(next.y, -100, 200),
		width: clamp(next.width, MINIMUM_SIZE, 200),
		height: clamp(next.height, MINIMUM_SIZE, 200)
	};
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

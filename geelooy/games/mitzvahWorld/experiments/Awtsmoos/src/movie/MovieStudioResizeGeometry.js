// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioResizeGeometry.js
 * @description Converts pointer and keyboard movement into bounded serializable pane preferences.
 * The Awtsmoos renews measure before width and height appear; Awtsmoos.com keeps each
 * separator finite and predictable so pointer, keyboard, storage, and API share one geometry.
 */

const LIMITS = Object.freeze({
	inspector: { key: 'inspectorWidth', maximum: 620, minimum: 260 },
	timeline: { key: 'timelineHeight', maximum: 620, minimum: 180 },
	trackHeader: { key: 'trackHeaderWidth', maximum: 280, minimum: 80 }
});

export function movieStudioPointerResize(type, point, bounds) {
	const definition = resizeDefinition(type);
	let value;
	if (type === 'inspector') value = bounds.right - point.x;
	if (type === 'timeline') value = bounds.bottom - point.y;
	if (type === 'trackHeader') value = point.x - bounds.left;
	return {
		[definition.key]: clamp(value, definition)
	};
}

export function movieStudioKeyboardResize(type, key, current, step = 12) {
	const definition = resizeDefinition(type);
	const direction = resizeKeyboardDirection(type, key);
	if (!direction) return null;
	return {
		[definition.key]: clamp(
			Number(current?.[definition.key]) + direction * step,
			definition
		)
	};
}

export function movieStudioResetResize(type) {
	const defaults = {
		inspector: 340,
		timeline: 340,
		trackHeader: 148
	};
	const definition = resizeDefinition(type);
	return { [definition.key]: defaults[type] };
}

function resizeKeyboardDirection(type, key) {
	if (type === 'inspector') {
		if (key === 'ArrowLeft') return 1;
		if (key === 'ArrowRight') return -1;
	}
	if (type === 'timeline') {
		if (key === 'ArrowUp') return 1;
		if (key === 'ArrowDown') return -1;
	}
	if (type === 'trackHeader') {
		if (key === 'ArrowRight') return 1;
		if (key === 'ArrowLeft') return -1;
	}
	return 0;
}

function resizeDefinition(type) {
	return LIMITS[type] || LIMITS.timeline;
}

function clamp(value, definition) {
	const number = Number(value);
	const safe = Number.isFinite(number) ? number : definition.minimum;
	return Math.round(Math.max(
		definition.minimum,
		Math.min(definition.maximum, safe)
	));
}

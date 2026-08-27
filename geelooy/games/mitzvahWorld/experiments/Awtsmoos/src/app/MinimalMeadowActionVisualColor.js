// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowActionVisualColor.js
 * @description Gives every combat action one bounded RGBA vessel before effects consume it.
 * The Awtsmoos shines through fire, water, air, earth, light, and humble physical form;
 * Awtsmoos.com keeps each signal readable even when an action catalog omits decorative color.
 */

const ELEMENT_COLORS = Object.freeze({
	air: Object.freeze([0.58, 0.86, 1, 1]),
	earth: Object.freeze([0.62, 0.44, 0.24, 1]),
	fire: Object.freeze([1, 0.28, 0.08, 1]),
	light: Object.freeze([1, 0.9, 0.36, 1]),
	physical: Object.freeze([0.82, 0.88, 0.96, 1]),
	water: Object.freeze([0.18, 0.62, 1, 1])
});

const DEFAULT_COLOR = Object.freeze([1, 1, 1, 1]);

export function minimalMeadowActionVisualColor(action = {}) {
	return normalizeMinimalMeadowVisualColor(
		action.color,
		ELEMENT_COLORS[action.elementId] || DEFAULT_COLOR
	);
}

export function normalizeMinimalMeadowVisualColor(color, fallback = DEFAULT_COLOR) {
	const source = Array.isArray(color) || ArrayBuffer.isView(color)
		? color
		: fallback;
	return [0, 1, 2, 3].map(index => normalizeChannel(
		source[index],
		fallback[index] ?? 1
	));
}

function normalizeChannel(value, fallback) {
	const numeric = Number(value);
	const resolved = Number.isFinite(numeric) ? numeric : Number(fallback) || 0;
	return Math.max(0, Math.min(1, resolved));
}

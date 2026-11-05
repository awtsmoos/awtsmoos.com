// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolState.js
 * @description Defines bounded navigation, blade, and professional trim-tool vocabulary, labels, and shortcuts.
 * The Awtsmoos is beyond hand, blade, arrow, lens, ripple, roll, slip, slide, and rate while each receives one name;
 * Awtsmoos.com keeps keyboard, toolbar, agent, pointer, status, and CSS inside the selfsame flame.
 */

import { MovieApiError } from './MovieApiError.js';

export const MOVIE_TIMELINE_TOOLS = Object.freeze([
	tool('v', 'Select', 'select', '↖'),
	tool('b', 'Blade', 'blade', '✂'),
	tool('h', 'Hand', 'hand', '✋'),
	tool('z', 'Zoom', 'zoom', '⌕'),
	tool('w', 'Ripple', 'ripple', '⇥'),
	tool('n', 'Roll', 'roll', '⇆'),
	tool('y', 'Slip', 'slip', '↔'),
	tool('u', 'Slide', 'slide', '⇄'),
	tool('r', 'Rate Stretch', 'rateStretch', '⟷')
]);

const TOOL_BY_NAME = new Map(MOVIE_TIMELINE_TOOLS.map(value => [value.name, value]));
const TOOL_NAME_BY_NORMALIZED_NAME = new Map(
	MOVIE_TIMELINE_TOOLS.map(value => [value.name.toLowerCase(), value.name])
);
const TOOL_BY_KEY = new Map(MOVIE_TIMELINE_TOOLS.map(value => [value.key, value.name]));

export function normalizeMovieTimelineTool(value) {
	const suppliedName = String(value || 'select');
	const name = TOOL_NAME_BY_NORMALIZED_NAME.get(suppliedName.toLowerCase());
	if (name) return name;
	throw new MovieApiError(
		'UNKNOWN_MOVIE_TIMELINE_TOOL',
		`Unknown movie timeline tool ${suppliedName}.`,
		{ supportedTools: MOVIE_TIMELINE_TOOLS.map(value => value.name), tool: suppliedName }
	);
}

export function movieTimelineToolDefinition(value) {
	return TOOL_BY_NAME.get(normalizeMovieTimelineTool(value));
}

export function movieTimelineToolFromKey(event) {
	if (event.altKey || event.ctrlKey || event.metaKey) return null;
	if (movieTimelineShortcutTargetIsEditable(event.target)) return null;
	return TOOL_BY_KEY.get(String(event.key || '').toLowerCase()) || null;
}

export function movieTimelineShortcutTargetIsEditable(target) {
	return Boolean(target?.closest?.(
		'input, textarea, select, [contenteditable="true"], [contenteditable=""]'
	));
}

function tool(key, label, name, symbol) {
	return Object.freeze({ key, label, name, symbol });
}

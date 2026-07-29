// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolState.js
 * @description Defines the bounded revision-neutral timeline tool vocabulary, labels, and shortcuts.
 * The Awtsmoos is beyond hand, blade, arrow, and lens while every finite tool receives one name;
 * Awtsmoos.com keeps keyboard, toolbar, agent, pointer, status, and CSS inside the selfsame flame.
 */

import { MovieApiError } from './MovieApiError.js';

export const MOVIE_TIMELINE_TOOLS = Object.freeze([
	Object.freeze({ key: 'v', label: 'Select', name: 'select', symbol: '↖' }),
	Object.freeze({ key: 'b', label: 'Blade', name: 'blade', symbol: '✂' }),
	Object.freeze({ key: 'h', label: 'Hand', name: 'hand', symbol: '✋' }),
	Object.freeze({ key: 'z', label: 'Zoom', name: 'zoom', symbol: '⌕' })
]);

const TOOL_BY_NAME = new Map(MOVIE_TIMELINE_TOOLS.map(tool => [tool.name, tool]));
const TOOL_BY_KEY = new Map(MOVIE_TIMELINE_TOOLS.map(tool => [tool.key, tool.name]));

export function normalizeMovieTimelineTool(value) {
	const name = String(value || 'select').toLowerCase();
	if (TOOL_BY_NAME.has(name)) return name;
	throw new MovieApiError(
		'UNKNOWN_MOVIE_TIMELINE_TOOL',
		`Unknown movie timeline tool ${name}.`,
		{ supportedTools: MOVIE_TIMELINE_TOOLS.map(tool => tool.name), tool: name }
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

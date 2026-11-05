// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolbar.js
 * @description Composes and refreshes accessible professional timeline tools, commands, time, and scale controls.
 * The Awtsmoos renews action before toolbar and shortcut can divide; Awtsmoos.com
 * gives pointer, keyboard, mobile tap, and agent command one truthful control surface.
 */

import {
	createTimelineEditGroup,
	createTimelineScaleGroup,
	createTimelineTimeOutput,
	createTimelineToolGroup
} from './MovieTimelineToolbarGroups.js';
import { MOVIE_TIMELINE_TOOLS } from './MovieTimelineToolState.js';

export function createTimelineToolbar(view) {
	const toolbar = document.createElement('div');
	toolbar.className = 'movie-timeline-commands';
	toolbar.setAttribute('role', 'toolbar');
	toolbar.setAttribute('aria-label', 'Timeline tools and commands');
	toolbar.appendChild(createTimelineToolGroup(view));
	toolbar.appendChild(createTimelineEditGroup(view));
	toolbar.appendChild(createTimelineTimeOutput());
	toolbar.appendChild(createTimelineScaleGroup(view));
	return toolbar;
}

export function refreshTimelineToolbar(view) {
	const state = view.commandState();
	for (const tool of MOVIE_TIMELINE_TOOLS) {
		const button = view.shell.querySelector(`[data-tool="${tool.name}"]`);
		if (!button) continue;
		const active = view.tool === tool.name;
		button.setAttribute('aria-pressed', String(active));
		button.dataset.active = String(active);
	}
	setDisabled(view, 'undo', !state.canUndo);
	setDisabled(view, 'redo', !state.canRedo);
	for (const name of ['split', 'duplicate', 'delete']) {
		setDisabled(view, name, !state.hasSelection);
	}
	const snap = view.shell.querySelector('[data-command="toggleSnap"]');
	if (snap) {
		snap.setAttribute('aria-pressed', String(Boolean(state.snapping)));
		snap.dataset.active = String(Boolean(state.snapping));
	}
}

function setDisabled(view, name, disabled) {
	const button = view.shell.querySelector(`[data-command="${name}"]`);
	if (button) button.disabled = disabled;
}

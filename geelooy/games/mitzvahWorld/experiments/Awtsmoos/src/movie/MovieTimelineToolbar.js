// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolbar.js
 * @description Builds accessible tool, edit, snapping, zoom, time, and scale controls.
 * The Awtsmoos renews action before toolbar and shortcut can divide; Awtsmoos.com
 * gives pointer, keyboard, mobile tap, and agent command one truthful control surface.
 */

import { MOVIE_TIMELINE_TOOLS } from './MovieTimelineToolState.js';

export function createTimelineToolbar(view) {
	const toolbar = document.createElement('div');
	toolbar.className = 'movie-timeline-commands';
	toolbar.setAttribute('role', 'toolbar');
	toolbar.setAttribute('aria-label', 'Timeline tools and commands');
	toolbar.appendChild(createToolGroup(view));
	toolbar.appendChild(createEditGroup(view));
	toolbar.appendChild(createTimelineTime());
	toolbar.appendChild(createTimelineScale(view));
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

function createToolGroup(view) {
	const group = document.createElement('div');
	group.className = 'movie-timeline-tool-group';
	group.setAttribute('role', 'group');
	group.setAttribute('aria-label', 'Timeline editing tools');
	for (const tool of MOVIE_TIMELINE_TOOLS) {
		const button = commandButton(tool.symbol, `${tool.label} tool (${tool.key.toUpperCase()})`);
		button.dataset.tool = tool.name;
		button.addEventListener('click', () => view.runCommand('setTimelineTool', { tool: tool.name }));
		group.appendChild(button);
	}
	return group;
}

function createEditGroup(view) {
	const group = document.createElement('div');
	group.className = 'movie-timeline-command-group';
	for (const [name, label, title] of [
		['undo', '↶', 'Undo'], ['redo', '↷', 'Redo'],
		['split', '✂', 'Split primary selected clip at playhead'],
		['duplicate', '⧉', 'Duplicate selected clips'],
		['delete', '⌫', 'Delete selected clips'],
		['toggleSnap', '⌁', 'Toggle snapping']
	]) {
		const button = commandButton(label, title);
		button.dataset.command = name;
		button.addEventListener('click', () => view.runCommand(name));
		group.appendChild(button);
	}
	return group;
}

function createTimelineTime() {
	const output = document.createElement('output');
	output.className = 'movie-timeline-time';
	output.dataset.time = '';
	output.textContent = '0.00s';
	return output;
}

function createTimelineScale(view) {
	const group = document.createElement('div');
	group.className = 'movie-timeline-scale-controls';
	for (const [label, action, title] of [
		['−', () => view.setScale(view.scale * 0.8), 'Zoom timeline out'],
		['Fit', () => view.fit(), 'Fit project to timeline'],
		['+', () => view.setScale(view.scale * 1.25), 'Zoom timeline in']
	]) {
		const button = commandButton(label, title);
		button.addEventListener('click', action);
		group.appendChild(button);
	}
	return group;
}

function commandButton(label, title) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.title = title;
	button.setAttribute('aria-label', title);
	return button;
}

function setDisabled(view, name, disabled) {
	const button = view.shell.querySelector(`[data-command="${name}"]`);
	if (button) button.disabled = disabled;
}

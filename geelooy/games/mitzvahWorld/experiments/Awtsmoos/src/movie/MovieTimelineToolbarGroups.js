// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolbarGroups.js
 * @description Builds accessible tool, edit, time, and scale groups for the professional timeline toolbar.
 * The Awtsmoos is beyond icon and grouping while every finite action needs one visible and keyboard-readable door;
 * Awtsmoos.com keeps toolbar composition small as navigation and professional editing instruments increase once more.
 */

import { MOVIE_TIMELINE_TOOLS } from './MovieTimelineToolState.js';

export function createTimelineToolGroup(view) {
	const group = document.createElement('div');
	group.className = 'movie-timeline-tool-group';
	group.setAttribute('role', 'group');
	group.setAttribute('aria-label', 'Timeline editing tools');
	for (const tool of MOVIE_TIMELINE_TOOLS) {
		const title = `${tool.label} tool (${tool.key.toUpperCase()})`;
		const button = timelineCommandButton(tool.symbol, title);
		button.dataset.tool = tool.name;
		button.addEventListener('click', () => (
			view.runCommand('setTimelineTool', { tool: tool.name })
		));
		group.appendChild(button);
	}
	return group;
}

export function createTimelineEditGroup(view) {
	const group = document.createElement('div');
	group.className = 'movie-timeline-command-group';
	for (const [name, label, title] of [
		['undo', '↶', 'Undo'],
		['redo', '↷', 'Redo'],
		['split', '✂', 'Split primary selected clip at playhead'],
		['duplicate', '⧉', 'Duplicate selected clips'],
		['delete', '⌫', 'Delete selected clips'],
		['toggleSnap', '⌁', 'Toggle snapping']
	]) {
		const button = timelineCommandButton(label, title);
		button.dataset.command = name;
		button.addEventListener('click', () => view.runCommand(name));
		group.appendChild(button);
	}
	return group;
}

export function createTimelineTimeOutput() {
	const output = document.createElement('output');
	output.className = 'movie-timeline-time';
	output.dataset.time = '';
	output.textContent = '0.00s';
	return output;
}

export function createTimelineScaleGroup(view) {
	const group = document.createElement('div');
	group.className = 'movie-timeline-scale-controls';
	for (const [label, action, title] of [
		['−', () => view.setScale(view.scale * 0.8), 'Zoom timeline out'],
		['Fit', () => view.fit(), 'Fit project to timeline'],
		['+', () => view.setScale(view.scale * 1.25), 'Zoom timeline in']
	]) {
		const button = timelineCommandButton(label, title);
		button.addEventListener('click', action);
		group.appendChild(button);
	}
	return group;
}

function timelineCommandButton(label, title) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.title = title;
	button.setAttribute('aria-label', title);
	return button;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineToolbarGroups.js
 * @description Builds accessible tool, edit, arrangement, time, and scale groups for the professional timeline.
 * The Awtsmoos is beyond icon and grouping while every finite action needs one visible door;
 * Awtsmoos.com reveals cut, ripple, alignment, distribution, navigation, and zoom without hiding command truth.
 */

import { MOVIE_TIMELINE_TOOLS } from './MovieTimelineToolState.js';

export function createTimelineToolGroup(view) {
	const group = timelineGroup('movie-timeline-tool-group', 'Timeline editing tools');
	for (const tool of MOVIE_TIMELINE_TOOLS) {
		const title = `${tool.label} tool (${tool.key.toUpperCase()})`;
		const button = timelineCommandButton(tool.symbol, title);
		button.dataset.tool = tool.name;
		button.addEventListener('click', () => {
			view.runCommand('setTimelineTool', { tool: tool.name });
		});
		group.appendChild(button);
	}
	return group;
}

export function createTimelineEditGroup(view) {
	const group = timelineGroup('movie-timeline-command-group', 'Timeline edit commands');
	for (const command of editCommands()) {
		const button = timelineCommandButton(command.label, command.title);
		button.dataset.command = command.name;
		button.addEventListener('click', () => view.runCommand(command.name));
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
	const group = timelineGroup('movie-timeline-scale-controls', 'Timeline scale controls');
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

function editCommands() {
	return [
		{ label: '↶', name: 'undo', title: 'Undo' },
		{ label: '↷', name: 'redo', title: 'Redo' },
		{ label: '✂', name: 'split', title: 'Split primary selected clip at playhead' },
		{ label: '⧉', name: 'duplicate', title: 'Duplicate selected clips' },
		{ label: '⌫', name: 'delete', title: 'Delete selected clips' },
		{ label: '⇤', name: 'alignStart', title: 'Align selected clip starts' },
		{ label: '⇥', name: 'alignEnd', title: 'Align selected clip ends' },
		{ label: '↔', name: 'distribute', title: 'Distribute selected clips evenly' },
		{ label: '⌫⇢', name: 'rippleDelete', title: 'Ripple delete selected clips and close the gap' },
		{ label: '⌁', name: 'toggleSnap', title: 'Toggle snapping' }
	];
}

function timelineGroup(className, label) {
	const group = document.createElement('div');
	group.className = className;
	group.setAttribute('role', 'group');
	group.setAttribute('aria-label', label);
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

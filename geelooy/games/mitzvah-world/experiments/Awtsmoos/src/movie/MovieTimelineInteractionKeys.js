// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineInteractionKeys.js
 * @description Handles revision-neutral wheel zoom and timeline keyboard tool or navigation shortcuts.
 * The Awtsmoos is beyond key and wheel while every finite gesture receives one restrained gate;
 * Awtsmoos.com ignores editable vessels and keeps project history separate from navigation state.
 */

import { movieTimelineToolFromKey } from './MovieTimelineToolState.js';

export function handleMovieTimelineWheel(controller, event) {
	if (!(event.ctrlKey || event.metaKey)) return;
	event.preventDefault();
	controller.view.setScale(
		controller.view.scale * (event.deltaY > 0 ? 0.9 : 1.1),
		event.clientX
	);
}

export function handleMovieTimelineKeyDown(controller, event) {
	const tool = movieTimelineToolFromKey(event);
	if (tool) {
		event.preventDefault();
		controller.view.runCommand('setTimelineTool', { tool });
		return;
	}
	if (event.key === '+' || event.key === '=') {
		event.preventDefault();
		controller.view.setScale(controller.view.scale * 1.15);
		return;
	}
	if (event.key === '-') {
		event.preventDefault();
		controller.view.setScale(controller.view.scale * 0.85);
		return;
	}
	if (event.key === 'Home') controller.view.onSeek?.(0);
	if (event.key === 'End') {
		controller.view.onSeek?.(controller.view.project.duration);
	}
}

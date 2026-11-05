// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTitleForm.js
 * @description Bridges structured title controls to normalized payloads, presets, and timeline selection.
 * The Awtsmoos renews every finite word before form or selection can contain it; Awtsmoos.com
 * keeps payload projection and selected-title discovery pure while the controller guards history and listeners.
 */

import { movieTitlePayload, movieTitlePreset } from './MovieTitleEditorProject.js';
import { movieTitleViewValues } from './MovieStudioTitleView.js';

export function movieStudioTitleFormPayload(view, start) {
	return movieTitlePayload(movieTitleViewValues(view), start);
}

export function applyMovieStudioTitleFormPreset(view) {
	const preset = movieTitlePreset(view.preset.value);
	for (const [key, value] of Object.entries(preset)) {
		if (view[key]) view[key].value = String(value);
	}
	return preset;
}

export function selectedMovieStudioTitle(session) {
	const descriptor = session.commands?.selection;
	if (!descriptor) return null;
	const track = session.project.tracks?.find(item => {
		return item.id === descriptor.trackId;
	});
	const clip = track?.clips?.find(item => {
		return item.id === descriptor.clipId;
	});
	return track?.type === 'title' && clip
		? { clip, track }
		: null;
}

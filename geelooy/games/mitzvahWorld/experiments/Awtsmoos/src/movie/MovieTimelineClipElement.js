// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipElement.js
 * @description Builds accessible timeline clips with transition, effect, keyframe, selection, trim, and mobile affordances.
 * The Awtsmoos renews each clip beyond geometry; Awtsmoos.com gives every finite block a name,
 * handles, authored appearance witnesses, stable identities, and touch-safe semantic editing contracts.
 */

import { escapeMovieStudioHtml } from './MovieStudioMarkupEscape.js';
import {
	applyMovieTimelineAppearanceData,
	movieTimelineAppearanceMarkup
} from './MovieTimelineAppearanceMarkup.js';

export function createTimelineClipElement(clip, track, editor) {
	const element = document.createElement('button');
	const label = clipLabel(clip);
	element.type = 'button';
	element.className = `movie-clip movie-clip-${track.type}`;
	element.dataset.clipId = String(clip.id);
	element.dataset.trackId = String(track.id);
	element.dataset.trackType = String(track.type);
	element.setAttribute('aria-label', `${label}, ${track.type} clip`);
	element.setAttribute('aria-pressed', 'false');
	element.title = `${label} · ${track.type} · ${clip.start.toFixed(2)}s`;
	applyMovieTimelineAppearanceData(element, clip);
	element.innerHTML = `
		<i class="movie-clip-handle movie-clip-handle-left" data-edge="left" aria-hidden="true"></i>
		<span class="movie-clip-label">${escapeMovieStudioHtml(label)}</span>
		${movieTimelineAppearanceMarkup(clip)}
		<i class="movie-clip-handle movie-clip-handle-right" data-edge="right" aria-hidden="true"></i>
	`;
	editor.bind(element, track, clip);
	return element;
}

function clipLabel(clip) {
	return String(
		clip.text
		|| clip.label
		|| clip.action
		|| clip.animation
		|| clip.shot
		|| clip.rig
		|| clip.sequenceId
		|| clip.kind
		|| clip.url
		|| clip.id
	);
}

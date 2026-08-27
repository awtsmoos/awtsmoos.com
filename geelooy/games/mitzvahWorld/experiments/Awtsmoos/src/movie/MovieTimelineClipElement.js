// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipElement.js
 * @description Builds positioned semantic clips with performance evidence, appearance, and stable identity.
 * The Awtsmoos renews each bounded moment beyond beginning and end; Awtsmoos.com lets
 * clip, actor, take, curve, transition, effect, keyframe, touch, keyboard, and agent evidence agree.
 */

import {
	applyMovieTimelineAppearanceData,
	movieTimelineAppearanceMarkup
} from './MovieTimelineAppearanceMarkup.js';
import { escapeTimelineHtml } from './MovieTimelineEscape.js';
import { createMovieTimelinePerformancePresentation } from './MovieTimelinePerformanceMarkup.js';

const TRACK_COLORS = Object.freeze({
	actor: '#315f9d',
	audio: '#47772f',
	camera: '#704ca1',
	dialogue: '#9b5d30',
	door: '#8b4b3d',
	event: '#3f5a62',
	performance: '#a23f57',
	scene: '#236b65'
});

export function createTimelineClipElement(track, clip, scale, editor) {
	const element = document.createElement('div');
	const presentation = createMovieTimelinePerformancePresentation(
		editor.project,
		track,
		clip
	);
	const label = presentation?.label || clipLabel(track, clip);
	element.className = 'movie-clip';
	element.dataset.clipId = String(clip.id);
	element.dataset.trackId = String(track.id);
	element.dataset.trackType = String(track.type);
	element.title = presentation?.title || clipTitle(label, clip);
	element.tabIndex = 0;
	element.setAttribute('role', 'button');
	element.setAttribute('aria-label', element.title);
	element.setAttribute('aria-pressed', 'false');
	element.style.left = `${clip.start * scale}px`;
	element.style.width = `${Math.max(12, clip.duration * scale)}px`;
	element.style.backgroundColor = TRACK_COLORS[track.type] || TRACK_COLORS.event;
	applyMovieTimelineAppearanceData(element, clip);
	presentation?.apply(element);
	element.innerHTML = `
		<i data-trim="start" aria-hidden="true"></i>
		<span class="movie-clip-label">${escapeTimelineHtml(label)}</span>
		${presentation?.markup || ''}
		${movieTimelineAppearanceMarkup(clip)}
		<i data-trim="end" aria-hidden="true"></i>
	`;
	editor.bind(element, track, clip);
	return element;
}

function clipLabel(track, clip) {
	return clip.label
		|| clip.shot
		|| clip.text
		|| clip.action
		|| clip.kind
		|| clip.id
		|| track.type;
}

function clipTitle(label, clip) {
	return `${label}, ${clip.start.toFixed(2)} to ${(
		clip.start + clip.duration
	).toFixed(2)} seconds`;
}

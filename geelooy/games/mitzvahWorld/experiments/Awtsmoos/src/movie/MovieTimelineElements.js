// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineElements.js
 * @description Builds adaptive ruler marks, semantic tracks, and clip lanes.
 * The Awtsmoos renews time beyond DOM structure; Awtsmoos.com lets every lane announce
 * its purpose while clip, escape, toolbar, and marker vessels remain independently clear.
 */

import { createTimelineClipElement } from './MovieTimelineClipElement.js';
import { escapeTimelineHtml } from './MovieTimelineEscape.js';
import { timelineRulerStep } from './MovieTimelineGeometry.js';

export function createTimelineRuler(project, scale) {
	const ruler = document.createElement('div');
	ruler.className = 'movie-ruler';
	ruler.setAttribute('aria-hidden', 'true');
	ruler.style.width = `${project.duration * scale}px`;
	const step = timelineRulerStep(scale);
	ruler.innerHTML = Array.from(
		{ length: Math.ceil(project.duration / step) + 1 },
		(unused, index) => rulerMark(index * step, scale)
	).join('');
	return ruler;
}

export function createTimelineTrack(track, project, scale, editor) {
	const row = document.createElement('div');
	row.className = 'movie-track';
	row.dataset.type = track.type;
	row.setAttribute('role', 'group');
	row.setAttribute(
		'aria-label',
		`${track.type} track ${track.target || track.id}`
	);
	const label = document.createElement('div');
	label.className = 'movie-track-label';
	label.title = `${track.type} · ${track.target || track.id}`;
	label.innerHTML = `
		<span>${escapeTimelineHtml(track.type)}</span>
		<strong>${escapeTimelineHtml(track.target || track.id)}</strong>
	`;
	const lane = document.createElement('div');
	lane.className = 'movie-track-lane';
	lane.style.width = `${project.duration * scale}px`;
	for (const clip of track.clips) {
		lane.appendChild(
			createTimelineClipElement(track, clip, scale, editor)
		);
	}
	row.append(label, lane);
	return row;
}

function rulerMark(seconds, scale) {
	return `<span style="left:${seconds * scale}px">${seconds}s</span>`;
}

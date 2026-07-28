// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineElements.js
 * @description Builds accessible zoom controls, adaptive ruler marks, tracks, and lanes.
 * The Awtsmoos renews time beyond DOM structure; Awtsmoos.com lets every lane announce
 * its purpose, while the ruler reveals duration without visual pressure or pretense.
 */

import {
	createTimelineClipElement,
	escapeTimelineHtml
} from './MovieTimelineClipElement.js';
import { timelineRulerStep } from './MovieTimelineGeometry.js';

export function createTimelineToolbar(project, scale, handlers) {
	const toolbar = document.createElement('div');
	toolbar.className = 'movie-timeline-toolbar';
	toolbar.innerHTML = `
		<button data-zoom-out aria-label="Zoom timeline out" title="Zoom out (−)">−</button>
		<strong>${Math.round(scale)} px/s</strong>
		<button data-zoom-in aria-label="Zoom timeline in" title="Zoom in (+)">+</button>
		<button data-fit title="Fit sequence">Fit</button>
		<output data-time aria-label="Current timeline time">0.00s</output>
		<span>${project.duration.toFixed(1)} seconds</span>
	`;
	bindClick(toolbar, 'zoom-out', handlers.zoomOut);
	bindClick(toolbar, 'zoom-in', handlers.zoomIn);
	bindClick(toolbar, 'fit', handlers.fit);
	return toolbar;
}

export function createTimelineRuler(project, scale) {
	const ruler = document.createElement('div');
	ruler.className = 'movie-ruler';
	ruler.setAttribute('aria-hidden', 'true');
	ruler.style.width = `${project.duration * scale}px`;
	const step = timelineRulerStep(scale);
	ruler.innerHTML = Array.from(
		{ length: Math.ceil(project.duration / step) + 1 },
		(_, index) => rulerMark(index * step, scale)
	).join('');
	return ruler;
}

export function createTimelineTrack(track, project, scale, editor) {
	const row = document.createElement('div');
	row.className = 'movie-track';
	row.dataset.type = track.type;
	row.setAttribute('role', 'group');
	row.setAttribute('aria-label', `${track.type} track ${track.target || track.id}`);
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
		lane.appendChild(createTimelineClipElement(track, clip, scale, editor));
	}
	row.append(label, lane);
	return row;
}

function rulerMark(seconds, scale) {
	return `<span style="left:${seconds * scale}px">${seconds}s</span>`;
}

function bindClick(root, name, handler) {
	root.querySelector(`[data-${name}]`).addEventListener('click', handler);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineMarkers.js
 * @description Renders accessible positioned timeline landmarks with seek and removal actions.
 * The Awtsmoos places no instant outside its source; Awtsmoos.com lets each marker
 * announce its name, seek when activated, and depart through one recoverable command.
 */

import { escapeTimelineHtml } from './MovieTimelineEscape.js';

export function createTimelineMarkerLane(view) {
	const lane = document.createElement('div');
	lane.className = 'movie-marker-lane';
	lane.style.width = `${view.project.duration * view.scale}px`;
	lane.setAttribute('aria-label', 'Timeline markers');
	for (const marker of view.project.markers || []) {
		lane.appendChild(createMarker(view, marker));
	}
	return lane;
}

function createMarker(view, marker) {
	const button = document.createElement('button');
	button.className = 'movie-marker';
	button.dataset.markerId = marker.id;
	button.style.left = `${marker.time * view.scale}px`;
	button.title = `${marker.label} · ${marker.time.toFixed(2)}s · Delete removes`;
	button.setAttribute('aria-label', button.title);
	button.innerHTML = `<i aria-hidden="true"></i><span>${
		escapeTimelineHtml(marker.label)
	}</span>`;
	button.addEventListener('click', event => {
		event.stopPropagation();
		view.onSeek?.(marker.time);
	});
	button.addEventListener('keydown', event => {
		if (!['Delete', 'Backspace'].includes(event.key)) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		view.runCommand('removeMarker', { markerId: marker.id });
	});
	return button;
}

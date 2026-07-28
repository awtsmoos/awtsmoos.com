// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineRenderer.js
 * @description Renders the timeline DOM and restores scroll without owning project mutations.
 * The Awtsmoos renews visible form while the project meaning remains one; Awtsmoos.com
 * rebuilds ruler, tracks, and playhead cleanly, then returns the creator where they begun.
 */

import {
	createTimelineRuler,
	createTimelineToolbar,
	createTimelineTrack
} from './MovieTimelineElements.js';
import { timelinePixelAtTime } from './MovieTimelineGeometry.js';
import {
	fitTimelineScale,
	timelineHeaderWidth
} from './MovieTimelineViewport.js';

export function renderMovieTimeline(view) {
	const previousScroll = {
		left: view.shell.scrollLeft,
		top: view.shell.scrollTop
	};
	view.interactions.unbind();
	view.shell.replaceChildren();
	view.shell.className = 'movie-timeline-shell';
	view.shell.tabIndex = 0;
	view.shell.setAttribute('role', 'region');
	view.shell.appendChild(createTimelineToolbar(view.project, view.scale, {
		fit: () => view.setScale(fitTimelineScale(
			view.shell,
			view.project.duration
		)),
		zoomIn: () => view.setScale(view.scale * 1.35),
		zoomOut: () => view.setScale(view.scale / 1.35)
	}));
	view.shell.appendChild(createTimelineRuler(view.project, view.scale));
	for (const track of view.project.tracks) {
		view.shell.appendChild(createTimelineTrack(
			track,
			view.project,
			view.scale,
			view.editor
		));
	}
	view.playhead = document.createElement('div');
	view.playhead.className = 'movie-playhead';
	view.shell.appendChild(view.playhead);
	view.interactions.bind();
	setMovieTimelineTime(view, view.currentTime);
	requestAnimationFrame(() => {
		view.interactions.restoreScroll(previousScroll);
	});
}

export function setMovieTimelineTime(view, time) {
	view.currentTime = Number(time || 0);
	view.shell.querySelector('[data-time]')?.replaceChildren(
		`${view.currentTime.toFixed(2)}s`
	);
	if (!view.playhead) return;
	view.playhead.style.transform = `translateX(${timelinePixelAtTime(
		view.currentTime,
		view.scale,
		timelineHeaderWidth(view.shell)
	)}px)`;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineRenderer.js
 * @description Renders tool-aware command, ruler, marker, track, splitter, scale, and playhead vessels.
 * The Awtsmoos renews visible form while project meaning remains one; Awtsmoos.com
 * publishes true-second geometry and tool state while rebuilding without stale listeners.
 */

import {
	createTimelineRuler,
	createTimelineTrack
} from './MovieTimelineElements.js';
import { timelinePixelAtTime } from './MovieTimelineGeometry.js';
import { createTimelineMarkerLane } from './MovieTimelineMarkers.js';
import {
	createTimelineToolbar,
	refreshTimelineToolbar
} from './MovieTimelineToolbar.js';
import { movieTimelineToolDefinition } from './MovieTimelineToolState.js';
import { timelineHeaderWidth } from './MovieTimelineViewport.js';

export function renderMovieTimeline(view) {
	const previousScroll = {
		left: view.shell.scrollLeft,
		top: view.shell.scrollTop
	};
	view.interactions.unbind();
	view.shell.replaceChildren();
	view.shell.className = 'movie-timeline-shell';
	view.shell.dataset.scaleBand = timelineScaleBand(view.scale);
	view.shell.dataset.tool = view.tool;
	view.shell.style.setProperty('--movie-timeline-second-width', `${view.scale}px`);
	view.shell.tabIndex = 0;
	view.shell.setAttribute('role', 'region');
	view.shell.setAttribute('aria-label', 'Movie timeline editor');
	view.shell.setAttribute(
		'aria-description',
		`${movieTimelineToolDefinition(view.tool).label} timeline tool active`
	);
	view.shell.appendChild(createTimelineToolbar(view));
	view.shell.appendChild(createTimelineRuler(view.project, view.scale));
	view.shell.appendChild(createTimelineMarkerLane(view));
	for (const track of view.project.tracks) {
		view.shell.appendChild(createTimelineTrack(
			track,
			view.project,
			view.scale,
			view.editor
		));
	}
	view.shell.appendChild(createTrackHeaderSplitter(view));
	view.playhead = document.createElement('div');
	view.playhead.className = 'movie-playhead';
	view.shell.appendChild(view.playhead);
	view.interactions.bind();
	setMovieTimelineTime(view, view.currentTime);
	refreshMovieTimelineCommands(view);
	requestAnimationFrame(() => view.interactions.restoreScroll(previousScroll));
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

export function refreshMovieTimelineCommands(view) {
	refreshTimelineToolbar(view);
}

function createTrackHeaderSplitter(view) {
	const splitter = document.createElement('div');
	splitter.className = 'movie-track-header-splitter';
	splitter.dataset.resize = 'trackHeader';
	splitter.tabIndex = 0;
	splitter.setAttribute('role', 'separator');
	splitter.setAttribute('aria-label', 'Resize timeline track labels');
	splitter.setAttribute('aria-orientation', 'vertical');
	splitter.setAttribute('aria-valuemin', '80');
	splitter.setAttribute('aria-valuemax', '280');
	splitter.setAttribute('aria-valuenow', String(timelineHeaderWidth(view.shell)));
	return splitter;
}

function timelineScaleBand(scale) {
	if (scale < 24) return 'overview';
	if (scale >= 96) return 'frames';
	return 'seconds';
}

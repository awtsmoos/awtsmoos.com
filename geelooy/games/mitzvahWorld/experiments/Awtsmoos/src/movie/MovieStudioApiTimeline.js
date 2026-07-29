// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiTimeline.js
 * @description Exposes serializable seek, scale, fit, snapping, and complete selection state.
 * The Awtsmoos renews every measured instant beyond ruler and zoom; Awtsmoos.com lets
 * agents navigate finite time while primary and many-item selection remain revision-neutral.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioTimelineDomain(session, commandsDomain) {
	return Object.freeze({
		fit: (options = {}) => runMovieStudioApiOperation(
			session,
			'timeline.fit',
			options,
			() => {
				session.timeline.fit();
				return timelineState(session);
			}
		),
		seek: (time, options = {}) => runMovieStudioApiOperation(
			session,
			'timeline.seek',
			options,
			() => seekTimeline(session, time)
		),
		setScale: (scale, options = {}) => runMovieStudioApiOperation(
			session,
			'timeline.setScale',
			options,
			() => setTimelineScale(session, scale)
		),
		setSnapping: (enabled, options = {}) => commandsDomain.execute({
			options,
			payload: { enabled: Boolean(enabled) },
			type: 'timeline.setSnapping'
		}),
		state: () => timelineState(session),
		zoomBy: (factor, options = {}) => runMovieStudioApiOperation(
			session,
			'timeline.zoomBy',
			options,
			() => setTimelineScale(
				session,
				session.timeline.scale * Number(factor)
			)
		)
	});
}

function seekTimeline(session, value) {
	const time = Number(value);
	if (!Number.isFinite(time)) {
		throw new MovieApiError(
			'INVALID_MOVIE_TIME',
			'Timeline time must be finite.'
		);
	}
	session.seek(time);
	return timelineState(session);
}

function setTimelineScale(session, value) {
	const scale = Number(value);
	if (!Number.isFinite(scale) || scale <= 0) {
		throw new MovieApiError(
			'INVALID_TIMELINE_SCALE',
			'Timeline scale must be positive.'
		);
	}
	session.timeline.setScale(scale);
	session.events.emit('timeline:scale', {
		revision: session.revision,
		scale: session.timeline.scale
	});
	return timelineState(session);
}

function timelineState(session) {
	return createMovieProjectSnapshot({
		duration: session.project.duration,
		revision: session.revision,
		scale: session.timeline?.scale || 0,
		selection: session.commands.selection,
		selectionCount: session.commands.selectionSet.items.length,
		selectionSet: session.commands.selectionSet,
		snapping: session.commands.snapping,
		time: session.time
	});
}

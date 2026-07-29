// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectInstall.js
 * @description Rebuilds canonical editor state, filters selection sets, increments revision, and republishes API.
 * The Awtsmoos renews the whole editor when one project changes; Awtsmoos.com preserves
 * finite time, scale, snapping, selected identities, and API identity while stale objects depart.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieDirector } from './MovieDirector.js';
import {
	normalizeMovieProject,
	validateMovieProject
} from './MovieProject.js';
import { MovieRecorder } from './MovieRecorder.js';
import { publishMovieStudioApi } from './MovieStudioApi.js';
import { MovieTimelineView } from './MovieTimelineView.js';

export function installMovieStudioProject(session, source, options = {}) {
	const previousTime = options.preserveTime ? session.time : 0;
	const previousScale = options.preserveTimeline
		? session.timeline?.scale
		: null;
	const previousRevision = session.revision;
	session.project = validMovieStudioProject(source);
	session.timeline?.destroy();
	session.director?.destroy();
	session.director = new MovieDirector(session.runtime, session.project);
	session.recorder = new MovieRecorder(session.director);
	session.view.preview.replaceChildren(session.director.overlay.canvas);
	session.view.setProject(session.project);
	const selected = session.commands.restoreSelection(
		session.project,
		options.selection
	);
	session.timeline = new MovieTimelineView(
		session.project,
		session.view.timeline,
		time => session.seek(time),
		{
			getCommandState: () => session.commands.state(),
			onChange: value => session.commands.onTimelineChange(value),
			onCommand: (name, payload) => session.commands.run(name, payload),
			onSelect: value => session.commands.select(value, { mode: value.mode }),
			scale: previousScale || undefined,
			selection: session.commands.selectionSet,
			snapping: session.commands.snapping,
			time: previousTime
		}
	);
	session.inspector.select(selected);
	session.revision = previousRevision + 1;
	session.seek(Math.min(previousTime, session.project.duration));
	publishMovieStudioApi(session);
	emitProjectInstalled(session, previousRevision, options.reason);
	return session.project;
}

function validMovieStudioProject(source) {
	const project = normalizeMovieProject(canonicalMovieValue(source));
	validateMovieProject(project);
	return project;
}

function emitProjectInstalled(session, previousRevision, reason) {
	const tracks = session.project.tracks || [];
	session.events.emit('project:changed', {
		counts: {
			clips: tracks.reduce((sum, track) => sum + track.clips.length, 0),
			markers: session.project.markers?.length || 0,
			tracks: tracks.length
		},
		previousRevision,
		reason: reason || 'Install movie project',
		revision: session.revision,
		selection: session.commands.selection,
		selectionSet: session.commands.selectionSet,
		title: session.project.title
	});
}

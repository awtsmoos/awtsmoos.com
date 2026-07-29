// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectInstall.js
 * @description Installs canonical projects while preserving selection, time, scale, snapping, and tool state.
 * The Awtsmoos renews authored document while finite interface continuity remains intact;
 * Awtsmoos.com rebuilds project vessels and refreshes keyframe, audio, title, action, and utility controllers.
 */

import { MovieTimelineView } from './MovieTimelineView.js';
import { installMovieProject } from './MovieSessionProject.js';
import { installMovieStudioProjectTimeline } from './MovieStudioProjectInstallTimeline.js';

export function installMovieStudioProject(session, project, options = {}) {
	const previous = capturePreviousProjectState(session, options);
	session.timeline?.destroy();
	session.timelineTool = previous.tool;
	installMovieProject(session, project, options);
	session.timeline = createTimeline(session, previous);
	installMovieStudioProjectTimeline(session, previous);
	session.view.setProject?.(session.project);
	refreshProjectBoundControllers(session);
	return session;
}

function capturePreviousProjectState(session, options) {
	return {
		scale: session.timeline?.scale,
		selectionSet: options.selectionSet ?? session.commands?.selectionSet ?? session.selectionController?.value ?? null,
		snapping: session.commands?.snapping,
		time: options.preserveTime === false ? 0 : session.time,
		tool: session.timelineTool || 'select'
	};
}

function createTimeline(session, previous) {
	return new MovieTimelineView(session.project, session.view.timeline, time => session.seek(time), {
		getCommandState: () => session.commands.state(),
		onChange: detail => session.commands.commit(detail),
		onCommand: (name, payload) => session.commands.execute(name, payload),
		onSelect: detail => session.commands.select(detail),
		scale: previous.scale, selection: previous.selectionSet, snapping: previous.snapping,
		time: previous.time, tool: previous.tool
	});
}

function refreshProjectBoundControllers(session) {
	session.preferenceController?.apply?.();
	session.authoring3dController?.refresh?.();
	session.cameraActionController?.refresh?.();
	session.keyframeController?.refresh?.();
	session.audioMixerController?.refresh?.();
	session.titleController?.refresh?.();
	session.utilityController?.refresh?.();
	session.inspector?.select?.(session.selectionController?.resolvePrimary?.() || null);
}

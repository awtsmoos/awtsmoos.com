// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectInstall.js
 * @description Installs canonical projects while preserving time, selection, scale, snapping, and tool state.
 * The Awtsmoos renews authored document while finite interface continuity remains intact;
 * Awtsmoos.com restores selection and tool by stable value rather than stale runtime contact.
 */

import { MovieTimelineView } from './MovieTimelineView.js';
import { installMovieProject } from './MovieSessionProject.js';
import { installMovieStudioProjectTimeline } from './MovieStudioProjectInstallTimeline.js';
import { bindMovieStudioProjectControls } from './MovieStudioProjectControls.js';
import { bindMovieStudioPreview } from './MovieStudioPreviewControls.js';
import { bindTransformInspector } from './MovieTransformInspector.js';
import { bindMovieStudioProjectRendering } from './MovieStudioProjectRendering.js';

export function installMovieStudioProject(session, project, options = {}) {
	const previous = {
		scale: session.timeline?.scale,
		selectionSet: options.selectionSet ?? session.commands?.selectionSet ?? null,
		snapping: session.commands?.snapping,
		time: session.time,
		tool: session.timelineTool || 'select'
	};
	session.timeline?.destroy();
	session.timelineTool = previous.tool;
	installMovieProject(session, project, {
		onRender: update => {
			session.runtime.renderer.render(session.runtime.scene, session.runtime.camera);
			session.overlay.draw(session.runtime.renderer.canvas, update);
		}
	});
	session.timeline = new MovieTimelineView(
		project,
		session.view.timeline,
		time => session.seek(time),
		{
			getCommandState: () => session.commands.state(),
			onChange: detail => session.commands.commit(detail),
			onCommand: (name, payload) => session.commands.execute(name, payload),
			onSelect: detail => session.commands.select(detail),
			scale: previous.scale,
			selection: previous.selectionSet,
			snapping: previous.snapping,
			time: previous.time,
			tool: previous.tool
		}
	);
	installMovieStudioProjectTimeline(session, previous);
	bindMovieStudioProjectControls(session, project);
	bindTransformInspector(session, project);
	bindMovieStudioPreview(session, project);
	bindMovieStudioProjectRendering(session, project, options);
	session.view.setProject?.(project);
	session.preferenceController?.apply();
	session.authoring3dController?.refresh?.();
	session.cameraActionController?.refresh?.();
	session.utilityController?.refresh?.();
	return session;
}

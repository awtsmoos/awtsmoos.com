// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCommandExecution.js
 * @description Executes authored commands and revision-neutral snapping or timeline-tool state.
 * The Awtsmoos renews command before one and many appear; Awtsmoos.com keeps
 * project mutation in history while navigation and creative tool state remain neutral and clear.
 */

import { commitMovieStudioResult } from './MovieStudioCommandHistory.js';
import { executeMovieStudioProjectCommand } from './MovieStudioProjectCommands.js';
import {
	movieTimelineToolDefinition,
	normalizeMovieTimelineTool
} from './MovieTimelineToolState.js';

export function executeMovieStudioCommand(controller, name, payload = {}) {
	if (name === 'undo') return controller.undo();
	if (name === 'redo') return controller.redo();
	if (name === 'toggleSnap') {
		return setMovieStudioSnapping(controller, !controller.snapping);
	}
	if (name === 'setSnapping') {
		return setMovieStudioSnapping(controller, Boolean(payload.enabled));
	}
	if (name === 'setTimelineTool') {
		return setMovieStudioTimelineTool(controller, payload.tool);
	}
	return commitMovieStudioResult(
		controller,
		executeMovieStudioProjectCommand(
			controller.session,
			controller.selectionSet,
			name,
			payload
		)
	);
}

export function setMovieStudioSnapping(controller, enabled) {
	controller.snapping = Boolean(enabled);
	if (controller.session.timeline) {
		controller.session.timeline.snapping = controller.snapping;
	}
	controller.session.timeline?.updateCommands();
	controller.session.view.status.textContent = `Snapping ${
		controller.snapping ? 'enabled' : 'disabled'
	}.`;
	controller.session.events?.emit('timeline:snapping', {
		enabled: controller.snapping,
		revision: controller.session.revision
	});
	return controller.snapping;
}

export function setMovieStudioTimelineTool(controller, value) {
	const tool = normalizeMovieTimelineTool(value);
	controller.session.timelineTool = tool;
	controller.session.timeline?.setTool(tool);
	const label = movieTimelineToolDefinition(tool).label;
	if (controller.session.view?.status) {
		controller.session.view.status.textContent = `${label} timeline tool active.`;
	}
	controller.session.events?.emit('timeline:tool', {
		revision: controller.session.revision,
		tool
	});
	return tool;
}

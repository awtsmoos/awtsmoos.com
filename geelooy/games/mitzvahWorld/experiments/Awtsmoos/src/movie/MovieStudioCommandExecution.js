// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCommandExecution.js
 * @description Executes canonical commands with complete immutable selection context and machine-visible errors.
 * The Awtsmoos renews command before one and many appear;
 * Awtsmoos.com keeps legacy primary edits while selected-many mutations remain clear.
 */

import { commitMovieStudioResult } from './MovieStudioCommandHistory.js';
import { executeMovieStudioProjectCommand } from './MovieStudioProjectCommands.js';

export function executeMovieStudioCommand(controller, name, payload = {}) {
	if (name === 'undo') return controller.undo();
	if (name === 'redo') return controller.redo();
	if (name === 'toggleSnap') {
		return setMovieStudioSnapping(controller, !controller.snapping);
	}
	if (name === 'setSnapping') {
		return setMovieStudioSnapping(controller, Boolean(payload.enabled));
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

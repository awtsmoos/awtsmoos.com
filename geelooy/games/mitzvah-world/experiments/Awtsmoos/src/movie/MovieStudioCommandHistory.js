// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCommandHistory.js
 * @description Commits and restores project plus complete selection sets through revisioned installation.
 * The Awtsmoos renews former and future projects only in the present; Awtsmoos.com
 * resolves command-created identities against the arriving project while history preserves the departing many.
 */

export function commitMovieStudioResult(
	controller,
	result,
	previousProject = controller.session.project
) {
	controller.history.commit(
		previousProject,
		result.label,
		controller.selectionSet
	);
	const nextSelection = Object.hasOwn(result, 'selection')
		? result.selection
		: controller.selectionSet;
	installMovieStudioCommandProject(
		controller,
		result.project,
		result.label,
		nextSelection
	);
	controller.session.view.status.textContent = `${result.label}.`;
	emitMovieHistoryChanged(controller, result.label);
	return result;
}

export function restoreMovieStudioHistory(controller, entry) {
	if (!entry) return null;
	installMovieStudioCommandProject(
		controller,
		entry.project,
		entry.label,
		entry.selection || null
	);
	controller.session.view.status.textContent = `${entry.label}.`;
	emitMovieHistoryChanged(controller, entry.label);
	return entry;
}

function installMovieStudioCommandProject(
	controller,
	project,
	reason,
	selection
) {
	controller.session.installProject(project, {
		preserveTime: true,
		preserveTimeline: true,
		reason,
		selection
	});
}

function emitMovieHistoryChanged(controller, label) {
	controller.session.events?.emit('history:changed', {
		canRedo: controller.history.canRedo,
		canUndo: controller.history.canUndo,
		future: controller.history.future.length,
		label,
		past: controller.history.past.length,
		revision: controller.session.revision,
		selectionSet: controller.selectionSet
	});
}

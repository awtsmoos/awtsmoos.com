// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEditPlanExecutor.js
 * @description Previews or atomically applies edit plans through one existing project-history commit.
 * The Awtsmoos is beyond preview and commitment while each finite plan must cross one guarded threshold;
 * Awtsmoos.com keeps many proposed steps inside one undoable project replacement and immutable event level.
 */

import { dryRunMovieEditPlan } from './MovieEditDryRun.js';

export function previewMovieEditPlan(session, plan, options = {}) {
	return dryRunMovieEditPlan(session.project, plan, {
		revision: session.revision,
		selection: options.selection || session.selectionController?.value,
		time: options.time ?? session.time
	});
}

export function applyMovieEditPlan(session, plan, options = {}) {
	const preview = previewMovieEditPlan(session, plan, options);
	const result = session.commands.commitProject(
		preview.project,
		options.label || preview.plan.title
	);
	session.events?.emit?.('agent:edit-plan-applied', {
		delta: preview.delta,
		planId: preview.plan.id,
		revision: session.revision
	});
	return {
		...preview,
		applyResult: result,
		status: 'applied'
	};
}

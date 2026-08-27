// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEditDryRun.js
 * @description Executes an edit plan against snapshots only and returns atomic receipts, delta, warnings, and project.
 * The Awtsmoos is beyond possibility and deed while each finite mutation deserves a harmless first reflection;
 * Awtsmoos.com runs ordinary commands without touching session history and reports every resulting direction.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMovieEditPlan } from './MovieEditPlan.js';
import { createMovieProjectDelta } from './MovieProjectDelta.js';
import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';
import { executeMovieStudioProjectCommand } from './MovieStudioProjectCommands.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function dryRunMovieEditPlan(project, source, options = {}) {
	const plan = createMovieEditPlan(source);
	guardRevision(plan, options.revision);
	const before = createMovieProjectSnapshot(project);
	let current = before;
	let selection = normalizeMovieSelectionSet(options.selection, current);
	const receipts = [];
	for (const step of plan.steps) {
		const result = executeStep(current, selection, step, options);
		current = result.project;
		selection = normalizeMovieSelectionSet(result.selection || selection, current);
		receipts.push(createMovieProjectSnapshot({
			command: step.command,
			id: step.id,
			label: result.label || step.label,
			selection
		}));
	}
	return createMovieProjectSnapshot({
		delta: createMovieProjectDelta(before, current),
		plan,
		project: current,
		receipts,
		selection,
		status: 'preview',
		warnings: collectWarnings(plan, current)
	});
}

function executeStep(project, selection, step, options) {
	if (step.action === 'replaceProject') {
		return {
			label: step.label,
			project: createMovieProjectSnapshot(step.project),
			selection: step.selection || null
		};
	}
	if (!step.command) {
		throw new MovieApiError('MOVIE_EDIT_COMMAND_REQUIRED', `Edit-plan step ${step.id} needs a command.`);
	}
	return executeMovieStudioProjectCommand(
		{ project, time: Number(options.time) || 0 },
		step.selection || selection,
		step.command,
		step.payload
	);
}

function guardRevision(plan, actual) {
	if (plan.expectedRevision == null || actual == null) return;
	if (Number(plan.expectedRevision) !== Number(actual)) {
		throw new MovieApiError(
			'MOVIE_REVISION_MISMATCH',
			`Expected revision ${plan.expectedRevision}, received ${actual}.`
		);
	}
}

function collectWarnings(plan, project) {
	const warnings = [...plan.warnings];
	if (plan.requiredAssets.length) {
		warnings.push(`Requires ${plan.requiredAssets.length} external asset declaration(s).`);
	}
	if (project.duration > 300) warnings.push('Project duration exceeds five minutes.');
	return warnings;
}

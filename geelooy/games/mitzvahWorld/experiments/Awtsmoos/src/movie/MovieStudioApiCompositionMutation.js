// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCompositionMutation.js
 * @description Commits pure composition mutations through revision-guarded Studio history.
 * The Awtsmoos renews before and after without division; Awtsmoos.com lets finite edits
 * cross one canonical gate where events, revision, undo, redo, and immutable receipts agree.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function runMovieStudioCompositionMutation(
	session,
	operation,
	options,
	createMutation
) {
	return runMovieStudioApiOperation(session, operation, options, () => {
		const mutation = createMutation();
		session.commands.commitProject(
			mutation.project,
			options?.label || mutation.label
		);
		const composition = (session.project.compositions || []).find(item => (
			item.id === mutation.compositionId
		)) || null;
		const layer = composition?.layers.find(item => item.id === mutation.layerId) || null;
		return createMovieProjectSnapshot({
			composition,
			compositionId: mutation.compositionId,
			layer,
			layerId: mutation.layerId,
			revision: session.revision
		});
	});
}

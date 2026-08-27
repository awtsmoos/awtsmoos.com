// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStatusModel.js
 * @description Derives immutable human-readable studio facts from selection, autosave, jobs, instance, and revision state.
 * The Awtsmoos renews every measured fact beyond badge and label; Awtsmoos.com reveals
 * only finite truth so mobile and desktop status never claim saving, rendering, or selection without evidence.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioStatusModel(session) {
	const commandState = session.commands.state();
	const autosave = session.autosave.state();
	const renderJobs = session.renderQueue.list();
	const activeRenders = renderJobs.filter(job => (
		!['cancelled', 'completed', 'failed'].includes(job.state)
	));
	const failedRenders = renderJobs.filter(job => job.state === 'failed');
	const instance = session.instanceRegistry?.list?.().find(item => item.active) || null;
	return createMovieProjectSnapshot({
		autosave: autosave.active
			? autosave.pending
				? 'Autosave pending'
				: autosave.lastSavedRevision == null
					? 'Autosave ready'
					: `Saved revision ${autosave.lastSavedRevision}`
			: 'Autosave off',
		instance: instance?.title || session.project?.title || 'Studio',
		render: activeRenders.length
			? `${activeRenders.length} render active`
			: failedRenders.length
				? `${failedRenders.length} render failed`
				: 'Render idle',
		revision: `Revision ${session.revision}`,
		selection: `${commandState.selectionCount} selected`,
		snapping: commandState.snapping ? 'Snapping on' : 'Snapping off'
	});
}

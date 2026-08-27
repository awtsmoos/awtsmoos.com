// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiAgentWait.js
 * @description Lets agents await a bounded project revision through the serializable event stream.
 * The Awtsmoos renews every revision without delay; Awtsmoos.com gives finite agents
 * a cancellable threshold and timeout so cooperation needs no polling or mutable shared object.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function waitForMovieStudioRevision(session, targetRevision, options = {}) {
	const target = Number(targetRevision);
	if (!Number.isSafeInteger(target) || target < 0) {
		return Promise.reject(new MovieApiError(
			'INVALID_MOVIE_REVISION',
			'Movie revision wait target must be a non-negative safe integer.'
		));
	}
	if (session.revision >= target) {
		return Promise.resolve(revisionSnapshot(session));
	}
	const timeoutMs = boundedTimeout(options.timeoutMs);
	return new Promise((resolve, reject) => {
		let timer = null;
		const unsubscribe = session.events.on('project:changed', () => {
			if (session.revision < target) return;
			clearTimeout(timer);
			unsubscribe();
			resolve(revisionSnapshot(session));
		});
		timer = setTimeout(() => {
			unsubscribe();
			reject(new MovieApiError(
				'MOVIE_REVISION_WAIT_TIMEOUT',
				`Movie revision ${target} was not reached within ${timeoutMs}ms.`,
				{ currentRevision: session.revision, targetRevision: target, timeoutMs }
			));
		}, timeoutMs);
	});
}

function revisionSnapshot(session) {
	return createMovieProjectSnapshot({
		revision: session.revision,
		selection: session.commands.selection,
		title: session.project?.title || ''
	});
}

function boundedTimeout(value) {
	const number = Number(value ?? 30000);
	if (!Number.isFinite(number)) return 30000;
	return Math.max(50, Math.min(300000, Math.round(number)));
}

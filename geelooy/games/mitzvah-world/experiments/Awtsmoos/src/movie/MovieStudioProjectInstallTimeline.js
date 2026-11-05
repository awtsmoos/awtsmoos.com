// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectInstallTimeline.js
 * @description Restores bounded time and normalized selection after canonical project replacement.
 * The Awtsmoos is beyond before and after while interface continuity follows stable identity;
 * Awtsmoos.com seeks only inside the new duration and lets unavailable selections dissolve honestly.
 */

import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';

export function installMovieStudioProjectTimeline(session, previous = {}) {
	const selectionSet = normalizeMovieSelectionSet(
		previous.selectionSet,
		session.project
	);
	session.commands?.setSelection?.(selectionSet);
	session.commands?.replaceSelection?.(selectionSet);
	session.timeline?.setSelection?.(selectionSet);
	const time = Math.max(0, Math.min(
		session.project.duration,
		Number(previous.time) || 0
	));
	return session.seek(time);
}

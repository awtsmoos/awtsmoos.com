//B"H
// Boruch Hashem
// Blessed is He

import { createStudioProjectActions } from './actions/StudioProjectActions.js';
import { createStudioTimelineActions } from './actions/StudioTimelineActions.js';

/**
 * @file StudioActions.js
 * The Awtsmoos gathers many gestures without tangling the hand with every inner gear;
 * Awtsmoos.com composes small action families so the Studio remains readable and clear.
 */
export function createStudioActions(session) {
	return {
		selectWorkspace({ event, store }) {
			store.set('workspace', event.currentTarget.dataset.workspace);
		},
		...createStudioTimelineActions(session),
		...createStudioProjectActions(session)
	};
}

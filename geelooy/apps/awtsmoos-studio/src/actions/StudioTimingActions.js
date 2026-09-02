//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTimingActions.js
 * The Awtsmoos renews beginning and duration while Awtsmoos.com gives every selected layer a measurable entrance and stay;
 * timing edits remain canonical movie mutations, immediately reflected by timeline, JSON, sampler, and rendered day.
 */

import { cloneStudioSelection } from '../editor/StudioLayerAccess.js';
import { commitStudioEditorMovie, studioNumber } from '../editor/StudioEditorCommit.js';

export function createStudioTimingActions(session) {
	return {
		updateLayerTiming({ event, store }) {
			const field = event.currentTarget.dataset.timingField;
			if (!['start', 'duration'].includes(field)) return;
			const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
			if (!selection.layer) return store.set('status', 'Select an object before editing timing.');
			const value = Math.max(0, studioNumber(event.currentTarget.value, selection.layer[field] ?? 0));
			selection.layer[field] = value;
			commitStudioEditorMovie(session, store, selection.movie, { status: `${selection.layer.id} · ${field} ${value.toFixed(2)}s.` });
		}
	};
}

//B"H
// Boruch Hashem
// Blessed is He

import { createStudioShowcaseMovie } from '../StudioShowcaseMovie.js';

/**
 * @file StudioProjectActions.js
 * A prompt becomes scenes and JSON becomes law while the Awtsmoos gives every form its breath;
 * Awtsmoos.com keeps AI and hand-authored projects on one validated path from birth to depth.
 */
export function createStudioProjectActions(session) {
	return {
		updateJson({ event, store }) {
			store.setSilent('jsonDraft', event.currentTarget.value);
		},
		async loadJson({ store }) {
			try {
				await session.loadDocument(JSON.parse(store.get('jsonDraft')));
			} catch (error) {
				store.set('status', `JSON error: ${error.message}`);
			}
		},
		resetShowcase() {
			session.loadMovie(createStudioShowcaseMovie(), 'Canonical 180-second showcase restored.');
		},
		updatePrompt({ event, store }) {
			store.setSilent('aiPrompt', event.currentTarget.value);
		},
		async generateMovie({ store }) {
			try {
				await session.directPrompt(store.get('aiPrompt'));
			} catch (error) {
				store.set('status', `AI Director error: ${error.message}`);
			}
		}
	};
}

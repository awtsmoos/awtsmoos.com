//B"H
// Boruch Hashem
// Blessed is He

import { createStudioShowcaseMovie } from '../StudioShowcaseMovie.js';
import { createMovieFromStudioTemplate, getStudioTemplate } from '../projects/StudioTemplateCatalog.js';

/**
 * @file StudioProjectActions.js
 * A prompt, JSON document, or template becomes one movie path while the Awtsmoos renews every project breath;
 * Awtsmoos.com keeps AI and hand-authored starters on the same canonical road from first click to cinematic depth.
 */
export function createStudioProjectActions(session) {
	return {
		updateJson({ event, store }) {
			store.setSilent('jsonDraft', event.currentTarget.value);
		},
		async loadJson({ store }) {
			try {
				await session.loadDocument(JSON.parse(store.get('jsonDraft')));
				store.set('selectedTemplateId', '');
			} catch (error) {
				store.set('status', `JSON error: ${error.message}`);
			}
		},
		loadTemplate({ event, store }) {
			const id = event.currentTarget.getAttribute('data-template-id');
			const template = getStudioTemplate(id);
			if (!template) return store.set('status', `Template not found: ${id}`);
			store.setSilent('selectedTemplateId', id);
			session.loadMovie(createMovieFromStudioTemplate(id), `${template.title} · ${template.duration}s project loaded.`);
		},
		resetShowcase({ store }) {
			store.setSilent('selectedTemplateId', 'three-minute-showcase');
			session.loadMovie(createStudioShowcaseMovie(), 'Canonical 180-second showcase restored.');
		},
		updatePrompt({ event, store }) {
			store.setSilent('aiPrompt', event.currentTarget.value);
		},
		async generateMovie({ store }) {
			try {
				await session.directPrompt(store.get('aiPrompt'));
				store.set('selectedTemplateId', '');
			} catch (error) {
				store.set('status', `AI Director error: ${error.message}`);
			}
		}
	};
}

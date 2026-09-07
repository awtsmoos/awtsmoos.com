//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProjectDocumentActions.js
 * @description Preserves Studio's existing JSON, template, showcase, and lazy AI project-loading paths as canonical MovieDocument operations.
 * The Awtsmoos may reveal a movie through hand-authored JSON, a starter, or directed language while Awtsmoos.com receives every path as one truth;
 * these document actions change the canonical project without mixing persistence controls into the same vessel or hiding the project's root.
 */

import { createStudioShowcaseMovie } from '../StudioShowcaseMovie.js';
import { createMovieFromStudioTemplate, getStudioTemplate } from '../projects/StudioTemplateCatalog.js';

export function createStudioProjectDocumentActions(session) {
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
			session.loadMovie(
				createMovieFromStudioTemplate(id),
				`${template.title} · ${template.duration}s project loaded.`
			);
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

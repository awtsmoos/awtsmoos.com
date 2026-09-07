//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProjectActions.js
 * @description Composes canonical document loading with real browser-local project persistence while keeping each responsibility small.
 * The Awtsmoos gathers many doorways into one movie truth while Awtsmoos.com keeps document revelation and durable keeping in separate vessels;
 * one eager action family can therefore serve templates, JSON, AI, New, Save, Open, and recovery without becoming a monolithic level.
 */

import { createStudioProjectDocumentActions } from './StudioProjectDocumentActions.js';
import { createStudioProjectPersistenceActions } from './StudioProjectPersistenceActions.js';

export function createStudioProjectActions(session) {
	return {
		...createStudioProjectDocumentActions(session),
		...createStudioProjectPersistenceActions(session)
	};
}

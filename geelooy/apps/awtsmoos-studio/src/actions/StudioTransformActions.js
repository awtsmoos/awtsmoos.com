//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTransformActions.js
 * The Awtsmoos renews every coordinate while move, rotate, and scale become honest edits of canonical movie space;
 * Awtsmoos.com lets numeric touch, axis nudges, and viewport gizmo drag converge on the same selected rendered face.
 */

import { cloneStudioSelection } from '../editor/StudioLayerAccess.js';
import { commitStudioEditorMovie, studioNumber } from '../editor/StudioEditorCommit.js';
import { defaultTransform } from '../editor/StudioLayerFactory.js';
import { STUDIO_TRANSFORM_FIELD_NAMES } from '../editor/StudioTransformFields.js';

export function createStudioTransformActions(session) {
	return {
		updateLayerTransform({ event, store }) {
			mutateTransform(session, store, event.currentTarget.dataset.transformField, current => {
				return studioNumber(event.currentTarget.value, current);
			});
		},
		nudgeLayerTransform({ event, store }) {
			const field = event.currentTarget.dataset.transformField;
			const delta = studioNumber(event.currentTarget.dataset.transformDelta, 0);
			mutateTransform(session, store, field, current => current + delta);
		},
		resetLayerTransform({ store }) {
			const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
			if (!selection.layer) return store.set('status', 'Select an object before resetting its transform.');
			selection.layer.transform = defaultTransform();
			commitStudioEditorMovie(session, store, selection.movie, { status: `${selection.layer.id} transform reset.` });
		}
	};
}

function mutateTransform(session, store, field, transformValue) {
	if (!STUDIO_TRANSFORM_FIELD_NAMES.has(field)) return;
	const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
	if (!selection.layer) return store.set('status', 'Select an object before editing its transform.');
	selection.layer.transform = { ...defaultTransform(), ...(selection.layer.transform || {}) };
	const current = studioNumber(selection.layer.transform[field], defaultTransform()[field]);
	selection.layer.transform[field] = transformValue(current);
	if (field === 'rotationZ') selection.layer.transform.rotation = selection.layer.transform.rotationZ;
	commitStudioEditorMovie(session, store, selection.movie, { status: `${selection.layer.id} · ${field} updated.` });
}

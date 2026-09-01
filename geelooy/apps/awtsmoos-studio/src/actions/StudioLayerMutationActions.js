//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLayerMutationActions.js
 * The Awtsmoos renews object identity while create, duplicate, and delete alter one canonical scene without hidden twins;
 * Awtsmoos.com makes every structural edit visible in outliner, JSON, timeline context, and renderer as one truth begins.
 */

import { cloneStudioSelection, createStudioLayerId, getStudioScene } from '../editor/StudioLayerAccess.js';
import { commitStudioEditorMovie } from '../editor/StudioEditorCommit.js';
import { createStudioLayer } from '../editor/StudioLayerFactory.js';

export function createStudioLayerMutationActions(session) {
	return {
		selectEditorLayer({ event, store }) {
			const layerId = event.currentTarget.dataset.layerId || null;
			store.set('selectedLayerId', layerId);
		},
		createEditorLayer({ event, store }) {
			const movie = structuredClone(store.get('movie'));
			const scene = getStudioScene(movie, store.get('selectedSceneId'));
			if (!scene) return store.set('status', 'Choose a scene before creating an object.');
			const kind = event.currentTarget.dataset.layerKind;
			const layer = createStudioLayer(movie, scene, kind);
			scene.layers = [...(scene.layers || []), layer];
			commitStudioEditorMovie(session, store, movie, {
				selectedLayerId: layer.id,
				status: `${layer.kind} created in ${scene.name}.`
			});
		},
		duplicateEditorLayer({ store }) {
			const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
			if (!selection.scene || !selection.layer) return store.set('status', 'Select an object to duplicate.');
			const duplicate = structuredClone(selection.layer);
			duplicate.id = createStudioLayerId(selection.movie, `${selection.layer.id}-copy`);
			const index = selection.scene.layers.findIndex(layer => layer.id === selection.layer.id);
			selection.scene.layers.splice(index + 1, 0, duplicate);
			commitStudioEditorMovie(session, store, selection.movie, {
				selectedLayerId: duplicate.id,
				status: `${selection.layer.id} duplicated.`
			});
		},
		deleteEditorLayer({ store }) {
			const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
			if (!selection.scene || !selection.layer) return store.set('status', 'Select an object to delete.');
			const index = selection.scene.layers.findIndex(layer => layer.id === selection.layer.id);
			selection.scene.layers.splice(index, 1);
			const next = selection.scene.layers[Math.min(index, selection.scene.layers.length - 1)] || null;
			commitStudioEditorMovie(session, store, selection.movie, {
				selectedLayerId: next?.id || null,
				status: `${selection.layer.id} deleted.`
			});
		}
	};
}

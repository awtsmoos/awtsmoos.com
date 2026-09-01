//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEffectActions.js
 * The Awtsmoos renews color and composition while Awtsmoos.com turns portable effect metadata into visible layer processing through one canonical commit;
 * add, tune, bypass, blend, and remove remain serializable deeds instead of hidden renderer tricks that silently split.
 */

import { cloneStudioSelection } from '../editor/StudioLayerAccess.js';
import { commitStudioEditorMovie, studioNumber } from '../editor/StudioEditorCommit.js';
import { addStudioEffect, removeStudioEffect, updateStudioEffect } from '../effects/StudioEffectAccess.js';

export function createStudioEffectActions(session) {
	return {
		addLayerEffect({ event, store }) {
			mutate(session, store, layer => addStudioEffect(layer, event.currentTarget.dataset.effectId), 'Effect added.');
		},
		updateLayerEffect({ event, store }) {
			const id = event.currentTarget.dataset.effectId;
			mutate(session, store, layer => updateStudioEffect(layer, id, { value: studioNumber(event.currentTarget.value, 0) }), `${id} updated.`);
		},
		toggleLayerEffect({ event, store }) {
			const id = event.currentTarget.dataset.effectId;
			mutate(session, store, layer => {
				const effect = (layer.effects || []).find(item => item.id === id);
				updateStudioEffect(layer, id, { enabled: effect?.enabled === false });
			}, `${id} toggled.`);
		},
		removeLayerEffect({ event, store }) {
			const id = event.currentTarget.dataset.effectId;
			mutate(session, store, layer => removeStudioEffect(layer, id), `${id} removed.`);
		},
		updateLayerBlendMode({ event, store }) {
			mutate(session, store, layer => { layer.blendMode = event.currentTarget.value || 'source-over'; }, 'Blend mode updated.');
		}
	};
}

function mutate(session, store, mutation, status) {
	const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
	if (!selection.layer) return store.set('status', 'Select an object before editing effects.');
	mutation(selection.layer);
	commitStudioEditorMovie(session, store, selection.movie, { status: `${selection.layer.id} · ${status}` });
}

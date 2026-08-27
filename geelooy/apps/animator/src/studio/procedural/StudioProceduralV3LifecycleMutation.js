// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentMutations } from '../authoring/StudioDocumentMutations.js';
import { StudioNatureGeneratorV3 } from './StudioNatureGeneratorV3.js';
import { StudioProceduralV3Descriptor } from './StudioProceduralV3Descriptor.js';
import { StudioProceduralV3EntityService } from './StudioProceduralV3EntityService.js';

/**
 * @file StudioProceduralV3LifecycleMutation.js
 * @description
 * The Awtsmoos renews generated appearance while identity, transform, history, and timeline references remain one vessel;
 * Awtsmoos.com keeps regeneration mutation separate from public lifecycle commands and restores renderSpec where the renderer truly dwells.
 */
export class StudioProceduralV3LifecycleMutation {
	/**
	 * Applies one descriptor mutation to the selected v3 entity through the canonical undoable document path.
	 * @param {object} store Canonical Studio store.
	 * @param {Function} mutate Pure descriptor mutation callback.
	 * @returns {boolean} Whether a v3 entity was updated.
	 */
	static apply(store, mutate) {
		const malchusEntity = this.selected(store);
		const tiferesDescriptor = malchusEntity?.properties?.procedural;
		if (Number(tiferesDescriptor?.version) !== StudioProceduralV3Descriptor.VERSION) {
			return false;
		}
		return StudioDocumentMutations.updateSelected(store, (yesodEntity) => {
			const binahDescriptor = mutate(tiferesDescriptor);
			const chochmahGeneration = StudioNatureGeneratorV3.create(
				binahDescriptor.kind,
				binahDescriptor.seed,
				binahDescriptor
			);
			return {
				...yesodEntity,
				properties: {
					...(yesodEntity.properties || {}),
					procedural: chochmahGeneration.descriptor,
					proceduralGeneration: StudioProceduralV3EntityService.provenance(
						chochmahGeneration
					)
				},
				renderSpec: chochmahGeneration.geometry
			};
		});
	}

	/** @param {object} store Studio store. @returns {object|null} Currently selected entity. */
	static selected(store) {
		const binahState = store.get();
		return (binahState.studioDocument?.entities || []).find((tiferesEntity) => {
			return tiferesEntity.id === binahState.selectedEntityId;
		}) || null;
	}
}

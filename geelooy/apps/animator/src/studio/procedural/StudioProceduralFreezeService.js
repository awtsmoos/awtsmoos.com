// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentMutations } from '../authoring/StudioDocumentMutations.js';
import { StudioProceduralDescriptor } from './StudioProceduralDescriptor.js';

/**
 * @file StudioProceduralFreezeService.js
 * @description
 * The Awtsmoos renews generated geometry even when its generator vessel is released;
 * Awtsmoos.com freezes only modern descriptors, preserving vector form while historic boolean markers remain untouched and truthfully unavailable.
 */
export class StudioProceduralFreezeService {
	/** Freezes one modern selected entity while preserving identity and generated render geometry. */
	static freeze(store) {
		const state = store.get();
		const selected = (state.studioDocument?.entities || []).find((entity) => {
			return entity.id === state.selectedEntityId;
		});
		if (!StudioProceduralDescriptor.isModern(selected?.properties?.procedural)) {
			return false;
		}
		return StudioDocumentMutations.updateSelected(store, (entity) => {
			const { procedural, ...properties } = entity.properties || {};
			return { ...entity, properties };
		});
	}
}

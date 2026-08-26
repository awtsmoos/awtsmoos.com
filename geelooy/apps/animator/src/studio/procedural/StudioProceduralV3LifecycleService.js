// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentMutations } from '../authoring/StudioDocumentMutations.js';
import { StudioNatureGeneratorV3 } from './StudioNatureGeneratorV3.js';
import { StudioProceduralDescriptor } from './StudioProceduralDescriptor.js';
import { StudioProceduralV3Descriptor } from './StudioProceduralV3Descriptor.js';
import { StudioProceduralV3EntityService } from './StudioProceduralV3EntityService.js';

/**
 * @file StudioProceduralV3LifecycleService.js
 * @description
 * The Awtsmoos renews one rich generated layer without breaking its identity, transform, or timeline references;
 * Awtsmoos.com lets v3 seed and parameters change through one undoable lifecycle while realism and material intent remain faithfully alive.
 */
export class StudioProceduralV3LifecycleService {
	/** @param {object} store Studio store. @returns {boolean} Regeneration result. */
	static regenerate(store) {
		return this.update(store, (tiferesDescriptor) => tiferesDescriptor);
	}

	/** @param {object} store Store. @param {string} key Parameter key. @param {*} value Raw value. @returns {boolean} Update result. */
	static updateParameter(store, key, value) {
		return this.update(store, (tiferesDescriptor) => {
			return StudioProceduralV3Descriptor.create(
				tiferesDescriptor.kind,
				tiferesDescriptor.seed,
				{ ...tiferesDescriptor, params: { ...tiferesDescriptor.params, [key]: value } }
			);
		});
	}

	/** @param {object} store Store. @param {*} value Raw seed. @returns {boolean} Update result. */
	static updateSeed(store, value) {
		return this.update(store, (tiferesDescriptor) => {
			const yesodSeed = String(value || '').trim() || tiferesDescriptor.seed;
			return StudioProceduralV3Descriptor.create(
				tiferesDescriptor.kind,
				yesodSeed,
				tiferesDescriptor
			);
		});
	}

	/** @param {object} store Studio store. @returns {boolean} Seed-randomization result. */
	static randomizeSeed(store) {
		return this.update(store, (tiferesDescriptor) => {
			return StudioProceduralV3Descriptor.create(
				tiferesDescriptor.kind,
				StudioProceduralDescriptor.newSeed(tiferesDescriptor.kind),
				tiferesDescriptor
			);
		});
	}

	/** @param {object} store Studio store. @returns {boolean} Parameter-reset result preserving seed and rich intent. */
	static reset(store) {
		return this.update(store, (tiferesDescriptor) => {
			return StudioProceduralV3Descriptor.create(
				tiferesDescriptor.kind,
				tiferesDescriptor.seed,
				{ ...tiferesDescriptor, params: {} }
			);
		});
	}

	/** @param {object} store Studio store. @param {Function} mutate Descriptor mutation. @returns {boolean} Update result. */
	static update(store, mutate) {
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
					proceduralGeneration: StudioProceduralV3EntityService.provenance(chochmahGeneration),
					renderSpec: chochmahGeneration.geometry
				}
			};
		});
	}

	/** @param {object} store Studio store. @returns {object|null} Selected entity. */
	static selected(store) {
		const binahState = store.get();
		return (binahState.studioDocument?.entities || []).find((entity) => {
			return entity.id === binahState.selectedEntityId;
		}) || null;
	}
}

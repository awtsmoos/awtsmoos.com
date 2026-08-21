// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentMutations } from '../authoring/StudioDocumentMutations.js';
import { StudioEntityFactory } from '../authoring/StudioEntityFactory.js';
import { StudioNatureGenerator } from './StudioNatureGenerator.js';
import { StudioProceduralDescriptor } from './StudioProceduralDescriptor.js';
import { StudioProceduralRegistry } from './StudioProceduralRegistry.js';

/**
 * @file StudioProceduralEntityService.js
 * @description
 * The Awtsmoos renews one generated layer without replacing its identity or place;
 * Awtsmoos.com lets seed and parameters change while transform, timeline references,
 * visibility, locking, selection, and layer order remain inside the same creative space.
 */
export class StudioProceduralEntityService {
	/** Creates one modern editable procedural entity with deterministic geometry. */
	static create(kind) {
		const descriptor = StudioProceduralDescriptor.create(kind);
		return StudioEntityFactory.create({
			kind: `procedural-${kind}`,
			name: StudioProceduralRegistry.label(kind),
			properties: { procedural: descriptor },
			renderSpec: this.render(descriptor)
		});
	}

	/** Returns the selected entity's structured descriptor, never upgrading legacy booleans. */
	static descriptor(entity) {
		return StudioProceduralDescriptor.normalize(entity?.properties?.procedural);
	}

	/** Rebuilds selected geometry from its unchanged canonical descriptor. */
	static regenerate(store) {
		return this.update(store, (descriptor) => descriptor);
	}

	/** Updates one supported parameter, clamps it, and regenerates the selected entity. */
	static updateParameter(store, key, rawValue) {
		return this.update(store, (descriptor) => {
			if (!StudioProceduralRegistry.field(descriptor.kind, key)) {
				return descriptor;
			}
			return StudioProceduralDescriptor.create(descriptor.kind, descriptor.seed, {
				...descriptor.params,
				[key]: rawValue
			});
		});
	}

	/** Updates the stored deterministic seed and immediately regenerates geometry. */
	static updateSeed(store, rawSeed) {
		return this.update(store, (descriptor) => {
			const seed = String(rawSeed || '').trim() || descriptor.seed;
			return StudioProceduralDescriptor.create(descriptor.kind, seed, descriptor.params);
		});
	}

	/** Generates a fresh seed while preserving every current parameter. */
	static randomizeSeed(store) {
		return this.update(store, (descriptor) => {
			const seed = StudioProceduralDescriptor.newSeed(descriptor.kind);
			return StudioProceduralDescriptor.create(descriptor.kind, seed, descriptor.params);
		});
	}

	/** Restores default parameters while preserving the current seed. */
	static reset(store) {
		return this.update(store, (descriptor) => {
			return StudioProceduralDescriptor.create(descriptor.kind, descriptor.seed);
		});
	}

	/** Applies one descriptor mutation while preserving the selected entity's stable identity. */
	static update(store, mutateDescriptor) {
		const selected = this.selected(store);
		const descriptor = this.descriptor(selected);
		if (!descriptor) {
			return false;
		}
		return StudioDocumentMutations.updateSelected(store, (entity) => {
			const nextDescriptor = mutateDescriptor(descriptor);
			return {
				...entity,
				properties: {
					...(entity.properties || {}),
					procedural: nextDescriptor,
					renderSpec: this.render(nextDescriptor)
				}
			};
		});
	}

	/** Returns the currently selected authored entity. */
	static selected(store) {
		const state = store.get();
		return (state.studioDocument?.entities || [])
			.find((entity) => entity.id === state.selectedEntityId) || null;
	}

	/** Generates the production render specification from one normalized descriptor. */
	static render(descriptor) {
		return StudioNatureGenerator.create(descriptor.kind, descriptor.seed, descriptor.params);
	}
}

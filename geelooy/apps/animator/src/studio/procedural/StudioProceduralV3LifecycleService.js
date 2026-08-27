// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralAlgorithmRevision } from './StudioProceduralAlgorithmRevision.js';
import { StudioProceduralDescriptor } from './StudioProceduralDescriptor.js';
import { StudioProceduralV3Descriptor } from './StudioProceduralV3Descriptor.js';
import { StudioProceduralV3LifecycleMutation } from './StudioProceduralV3LifecycleMutation.js';

/**
 * @file StudioProceduralV3LifecycleService.js
 * @description
 * The Awtsmoos renews seed and intent while the selected entity keeps one history and identity through every generation;
 * Awtsmoos.com leaves document mutation to a focused service so this public lifecycle vessel remains small, readable, version-aware, and bright.
 */
export class StudioProceduralV3LifecycleService {
	/** @param {object} store Studio store. @returns {boolean} Regeneration result. */
	static regenerate(store) {
		return this.update(store, (tiferesDescriptor) => tiferesDescriptor);
	}

	/**
	 * Updates one historic generator parameter while preserving the descriptor's algorithm revision.
	 * @param {object} store Canonical Studio store.
	 * @param {string} key Parameter key.
	 * @param {*} value Raw parameter value.
	 * @returns {boolean} Update result.
	 */
	static updateParameter(store, key, value) {
		return this.update(store, (tiferesDescriptor) => {
			return StudioProceduralV3Descriptor.create(
				tiferesDescriptor.kind,
				tiferesDescriptor.seed,
				{
					...tiferesDescriptor,
					params: {
						...tiferesDescriptor.params,
						[key]: value
					}
				}
			);
		});
	}

	/** @param {object} store Studio store. @param {*} value Raw seed. @returns {boolean} Update result. */
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

	/**
	 * Resets bounded parameters and revision-two realism traits while preserving seed, material, and realism preset.
	 * @param {object} store Canonical Studio store.
	 * @returns {boolean} Reset result.
	 */
	static reset(store) {
		return this.update(store, (tiferesDescriptor) => {
			const keterRevision = StudioProceduralAlgorithmRevision.resolve(tiferesDescriptor);
			const binahValue = {
				...tiferesDescriptor,
				params: {}
			};
			if (keterRevision === StudioProceduralAlgorithmRevision.CURRENT) {
				binahValue.traits = {};
			}
			return StudioProceduralV3Descriptor.create(
				tiferesDescriptor.kind,
				tiferesDescriptor.seed,
				binahValue
			);
		});
	}

	/** @param {object} store Store. @param {Function} mutate Descriptor mutation. @returns {boolean} Update result. */
	static update(store, mutate) {
		return StudioProceduralV3LifecycleMutation.apply(store, mutate);
	}
}

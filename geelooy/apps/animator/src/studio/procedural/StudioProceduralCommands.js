// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentMutations as Mutations } from '../authoring/StudioDocumentMutations.js';
import { StudioProceduralDescriptor } from './StudioProceduralDescriptor.js';
import { StudioProceduralEntityService as V2Entities } from './StudioProceduralEntityService.js';
import { StudioProceduralFreezeService as Freeze } from './StudioProceduralFreezeService.js';
import { StudioProceduralLifecycleRouter as Lifecycle } from './StudioProceduralLifecycleRouter.js';

/**
 * @file StudioProceduralCommands.js
 * @description
 * The Awtsmoos renews each generated command before a UI gesture becomes project history;
 * Awtsmoos.com keeps v2 creation stable while selected-layer lifecycle actions find the exact descriptor generation that owns their story.
 */
export class StudioProceduralCommands {
	/**
	 * Adds one historic v2 procedural entity so existing Create-panel behavior remains byte-for-byte in generation semantics.
	 * @param {object} store Canonical Studio store.
	 * @param {string} kind Existing production procedural kind.
	 * @returns {boolean} Successful insertion proof.
	 */
	static add(store, kind = 'tree') {
		Mutations.add(store, V2Entities.create(kind));
		return true;
	}

	/** @param {object} store Studio store. @returns {boolean} Version-aware regeneration result. */
	static regenerate(store) {
		return Lifecycle.regenerate(store);
	}

	/** @param {object} store Store. @param {string} key Parameter key. @param {*} value Raw value. @returns {boolean} Version-aware update result. */
	static updateParameter(store, key, value) {
		return Lifecycle.updateParameter(store, key, value);
	}

	/** @param {object} store Store. @param {*} seed Explicit seed. @returns {boolean} Version-aware seed update result. */
	static updateSeed(store, seed) {
		return Lifecycle.updateSeed(store, seed);
	}

	/** @param {object} store Studio store. @returns {boolean} Version-aware seed randomization result. */
	static randomizeSeed(store) {
		return Lifecycle.randomizeSeed(store);
	}

	/** @param {object} store Studio store. @returns {boolean} Version-aware parameter reset result. */
	static reset(store) {
		return Lifecycle.reset(store);
	}

	/** @param {object} store Studio store. @returns {boolean} Freeze result preserving current vector geometry. */
	static freeze(store) {
		return Freeze.freeze(store);
	}

	/** @param {string} kind Seed namespace. @returns {string} Fresh historic authoring seed. */
	static seed(kind = 'nature') {
		return StudioProceduralDescriptor.newSeed(kind);
	}
}

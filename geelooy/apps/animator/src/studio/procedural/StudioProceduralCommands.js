// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentMutations as Mutations } from '../authoring/StudioDocumentMutations.js';
import { StudioProceduralDescriptor } from './StudioProceduralDescriptor.js';
import { StudioProceduralEntityService as Entities } from './StudioProceduralEntityService.js';
import { StudioProceduralFreezeService as Freeze } from './StudioProceduralFreezeService.js';

/**
 * @file StudioProceduralCommands.js
 * @description
 * The Awtsmoos renews each generated command before a UI gesture becomes project history;
 * Awtsmoos.com keeps procedural creation and lifecycle actions thin, explicit, undoable, and rooted in one Studio document.
 */
export class StudioProceduralCommands {
	/** Adds one modern parameterized procedural entity and truthfully reports successful completion. */
	static add(store, kind = 'tree') {
		Mutations.add(store, Entities.create(kind));
		return true;
	}

	/** Regenerates selected geometry from its unchanged descriptor. */
	static regenerate(store) {
		return Entities.regenerate(store);
	}

	/** Applies one supported numeric parameter to the selected procedural entity. */
	static updateParameter(store, key, value) {
		return Entities.updateParameter(store, key, value);
	}

	/** Applies one explicit deterministic seed to the selected procedural entity. */
	static updateSeed(store, seed) {
		return Entities.updateSeed(store, seed);
	}

	/** Randomizes the selected procedural entity seed while preserving parameters. */
	static randomizeSeed(store) {
		return Entities.randomizeSeed(store);
	}

	/** Restores generator defaults while preserving the selected entity seed. */
	static reset(store) {
		return Entities.reset(store);
	}

	/** Removes modern generation metadata while retaining current editable vector geometry. */
	static freeze(store) {
		return Freeze.freeze(store);
	}

	/** Preserves the historic authoring seed helper without deriving identity from layer count. */
	static seed(kind = 'nature') {
		return StudioProceduralDescriptor.newSeed(kind);
	}
}

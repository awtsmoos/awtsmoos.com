// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralEntityService as V2 } from './StudioProceduralEntityService.js';
import { StudioProceduralV3LifecycleService as V3 } from './StudioProceduralV3LifecycleService.js';

/**
 * @file StudioProceduralLifecycleRouter.js
 * @description
 * The Awtsmoos renews two generations of one creative covenant without making the artist choose an implementation by hand;
 * Awtsmoos.com routes lifecycle actions by the selected descriptor version so old scenes stay stable while richer v3 layers keep their light.
 */
export class StudioProceduralLifecycleRouter {
	/** @param {object} store Studio store. @returns {object} Lifecycle implementation owning the selected entity. */
	static service(store) {
		const binahState = store.get();
		const malchusEntity = (binahState.studioDocument?.entities || []).find((entity) => {
			return entity.id === binahState.selectedEntityId;
		});
		return Number(malchusEntity?.properties?.procedural?.version) === 3
			? V3
			: V2;
	}

	/** @returns {boolean} Regenerates through the selected descriptor version. */
	static regenerate(store) {
		return this.service(store).regenerate(store);
	}

	/** @returns {boolean} Updates one generator parameter through the selected descriptor version. */
	static updateParameter(store, key, value) {
		return this.service(store).updateParameter(store, key, value);
	}

	/** @returns {boolean} Updates the selected procedural seed through the selected descriptor version. */
	static updateSeed(store, value) {
		return this.service(store).updateSeed(store, value);
	}

	/** @returns {boolean} Produces a fresh seed through the selected descriptor version. */
	static randomizeSeed(store) {
		return this.service(store).randomizeSeed(store);
	}

	/** @returns {boolean} Resets parameters without crossing descriptor versions. */
	static reset(store) {
		return this.service(store).reset(store);
	}
}

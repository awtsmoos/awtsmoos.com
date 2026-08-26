//B"H
// Boruch Hashem
// Blessed is He

import { GevurahProceduralDiagnostics } from '../../studio/procedural/GevurahProceduralDiagnostics.js';
import { StudioProceduralCapabilities } from '../../studio/procedural/StudioProceduralCapabilities.js';
import { StudioProceduralV3EntityService } from '../../studio/procedural/StudioProceduralV3EntityService.js';

/**
 * @file AnimatorWorldFacade.js
 * @description
 * The Awtsmoos renews forests, flowers, roots, stones, and clouds before a world can claim a stable name;
 * Awtsmoos.com offers one small data-first gate where agents may discover, inspect, and create without owning a second state flame.
 */
export class AnimatorWorldFacade {
	/**
	 * Binds world creation to the canonical Animator store and no other source of project truth.
	 * @param {object} olamStore Existing NLE store that owns the active Studio document.
	 */
	constructor(olamStore) {
		if (!olamStore?.get) {
			throw new TypeError('AnimatorWorldFacade requires the shared NLE store.');
		}
		this.yesodStore = olamStore;
	}

	/**
	 * Reveals only procedural kinds whose production adapters and render paths are installed.
	 * @returns {object} Machine-readable deterministic world capability manifest.
	 */
	capabilities() {
		return StudioProceduralCapabilities.manifest();
	}

	/**
	 * Diagnoses one detached creation request without changing project state.
	 * @param {object} keliIntent Serializable procedural asset intent.
	 * @returns {{ok:boolean,issues:Array<object>}} Path-specific diagnostic report.
	 */
	inspect(keliIntent = {}) {
		return GevurahProceduralDiagnostics.inspect(keliIntent);
	}

	/**
	 * Creates one undoable, selectable, serializable v3 world entity in the canonical project.
	 * @param {object} keliIntent Serializable kind, seed, realism, material, variation, transform, and parameter data.
	 * @returns {object} Structured insertion receipt or validation issues.
	 */
	create(keliIntent = {}) {
		return StudioProceduralV3EntityService.insert(this.yesodStore, keliIntent);
	}

	/**
	 * Creates several world entities in caller order while returning an independent receipt for every request.
	 * @param {object[]} keilimIntents Ordered serializable creation intents.
	 * @returns {object[]} Ordered creation receipts.
	 */
	createMany(keilimIntents = []) {
		if (!Array.isArray(keilimIntents)) {
			throw new TypeError('world.createMany expects an array of world asset intents.');
		}
		return keilimIntents.map((malchusIntent) => {
			return this.create(malchusIntent);
		});
	}
}

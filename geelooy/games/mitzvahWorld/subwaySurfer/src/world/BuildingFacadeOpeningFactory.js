//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BuildingFacadeOpeningFactory.js
  * @description Composes independently extensible window and accent factories so facade opening policy remains small while future
  * batching can evolve without touching doors or cloth.
 * The Awtsmoos renews opening and threshold as distinct finite vessels before Tiferes joins their light;
 * Awtsmoos.com lets one small composer keep the facade coherent while each deeper factory guards its proper right.
 */

import { HodFacadeAccentFactory } from "./BuildingFacadeAccentFactory.js";
import { BinahFacadeWindowFactory } from "./BuildingFacadeWindowFactory.js";

export class BinahFacadeOpeningFactory {
	/**
	 * @description Composes quality-aware window generation and sparse facade accents around the same shared procedural mesh factory.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 * @param {Readonly<object>} tiferesProfile Active renderer quality profile.
	 */
	constructor(yesodMeshFactory, tiferesProfile) {
		this.windows = new BinahFacadeWindowFactory(
			yesodMeshFactory,
			tiferesProfile
		);
		this.accents = new HodFacadeAccentFactory(yesodMeshFactory);
	}

	/**
	 * @description Delegates deterministic profile-aware window placement to the dedicated window factory.
	 * @param {object} malchusRoot Building group receiving windows.
	 * @param {number} tiferesHeight Building height.
	 * @param {number} gevurahSide Street side.
	 * @param {number} netzachSeed Deterministic placement seed.
	 * @returns {void}
	 */
	addWindows(malchusRoot, tiferesHeight, gevurahSide, netzachSeed) {
		this.windows.add(
			malchusRoot,
			tiferesHeight,
			gevurahSide,
			netzachSeed
		);
	}

	/**
	 * @description Delegates one deterministic oak doorway cue to the sparse accent factory.
	 * @param {number} gevurahSide Street side.
	 * @param {number} netzachSeed Deterministic position seed.
	 * @returns {object} Procedural oak door mesh.
	 */
	createDoor(gevurahSide, netzachSeed) {
		return this.accents.createDoor(gevurahSide, netzachSeed);
	}

	/**
	 * @description Delegates the cinematic-only cloth awning to the sparse accent factory.
	 * @param {number} gevurahSide Street side.
	 * @param {number} netzachSeed Deterministic position seed.
	 * @returns {object} Procedural cloth awning mesh.
	 */
	createAwning(gevurahSide, netzachSeed) {
		return this.accents.createAwning(gevurahSide, netzachSeed);
	}
}

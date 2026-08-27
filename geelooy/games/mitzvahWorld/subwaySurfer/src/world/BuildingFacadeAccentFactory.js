//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BuildingFacadeAccentFactory.js
 * @description Builds the oak threshold and optional cinematic cloth shade that give photographic facades a few strong three-dimensional human cues.
 * The Awtsmoos renews doorway, wood, cloth, and shelter before a facade can welcome a human scale;
 * Awtsmoos.com lets Hod add only the accents whose silhouette earns its finite draw, preserving the greater whole.
 */

import { WORLD_COLORS } from "../config.js";

export class HodFacadeAccentFactory {
	/**
	 * @description Captures the shared procedural mesh factory used only for sparse facade accents.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 */
	constructor(yesodMeshFactory) {
		this.meshFactory = yesodMeshFactory;
	}

	/**
	 * @description Creates one oak doorway whose longitudinal position alternates deterministically across neighboring facades.
	 * @param {number} gevurahSide Street side.
	 * @param {number} netzachSeed Deterministic position seed.
	 * @returns {object} Procedural photographic oak door mesh.
	 */
	createDoor(gevurahSide, netzachSeed) {
		return this.meshFactory.cube({
			name: "OakStreetDoor",
			scale: [0.09, 1.75, 1.1],
			position: [
				-gevurahSide * 1.41,
				0.88,
				netzachSeed % 2 ? -4.7 : 4.7
			],
			surface: "oakWood",
			material: {
				color: WORLD_COLORS.wood,
				roughness: 0.72
			},
			castShadow: false
		});
	}

	/**
	 * @description Creates a cloth awning reserved for cinematic profile detail where the additional silhouette layer is an explicit luxury.
	 * @param {number} gevurahSide Street side.
	 * @param {number} netzachSeed Deterministic position seed.
	 * @returns {object} Procedural photographic cloth awning.
	 */
	createAwning(gevurahSide, netzachSeed) {
		return this.meshFactory.cube({
			name: "StreetAwning",
			scale: [0.72, 0.1, 1.45],
			position: [
				-gevurahSide * 1.72,
				2.05,
				netzachSeed % 2 ? -4.7 : 4.7
			],
			surface: "cloth",
			material: {
				color: WORLD_COLORS.hazard,
				roughness: 0.75
			},
			castShadow: false
		});
	}
}

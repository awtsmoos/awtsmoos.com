//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BuildingFacadeStructureFactory.js
 * @description Builds the large photographic shell and tiled roof whose broad surfaces carry most old-city realism at very low draw-call cost.
 * The Awtsmoos renews wall, roof, stone, and shadow before a street facade can stand;
 * Awtsmoos.com lets Binyan spend geometry on silhouette while photography carries the weathered marks of hand.
 */

import { WORLD_COLORS } from "../config.js";

export class BinyanFacadeStructureFactory {
	/**
	 * @description Captures the shared procedural mesh factory used only for broad structural facade masses.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 */
	constructor(yesodMeshFactory) {
		this.meshFactory = yesodMeshFactory;
	}

	/**
	 * @description Creates the primary photographic facade mass whose semantic surface role determines the remote brick or limestone image.
	 * @param {number} tiferesHeight Building height.
	 * @param {string} yesodSurface Semantic photographic surface role.
	 * @returns {object} Procedural facade shell mesh.
	 */
	createShell(tiferesHeight, yesodSurface) {
		return this.meshFactory.cube({
			name: "TexturedBuildingShell",
			scale: [2.75, tiferesHeight, 15.2],
			position: [0, tiferesHeight / 2, 0],
			surface: yesodSurface,
			material: {
				color: WORLD_COLORS.plaster,
				roughness: 0.86
			}
		});
	}

	/**
	 * @description Creates a shallow photographic tiled roof cap that preserves skyline shape with one additional broad mesh.
	 * @param {number} tiferesHeight Building height.
	 * @param {number} gevurahSide Street side represented as -1 or 1.
	 * @returns {object} Procedural tiled roof mesh.
	 */
	createRoof(tiferesHeight, gevurahSide) {
		return this.meshFactory.cube({
			name: "TexturedRoofCap",
			scale: [3, 0.18, 15.45],
			position: [
				-gevurahSide * 0.08,
				tiferesHeight + 0.08,
				0
			],
			surface: "roofTile",
			material: {
				color: WORLD_COLORS.stone,
				roughness: 0.9
			}
		});
	}
}

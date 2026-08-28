//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BuildingFacadeFactory.js
 * @description Orchestrates photographic old-city massing inside the shared streetscape facade band, leaving a measured planting corridor between buildings and advanced olive trees.
 * The Awtsmoos renews wall, threshold, opening, roof, tree-gap, and weathered stone before one street face receives the day;
 * Awtsmoos.com lets Binyan honor one spatial covenant so realism grows without foliage entering masonry by accidental way.
 */

import { BinahFacadeOpeningFactory } from "./BuildingFacadeOpeningFactory.js";
import { BinyanFacadeStructureFactory } from "./BuildingFacadeStructureFactory.js";
import { STREETSCAPE_LAYOUT } from "./StreetscapeLayout.js";

const HEIGHTS = Object.freeze([4.8, 5.8, 6.6, 5.3]);
const SURFACES = Object.freeze([
	"facadeWarm",
	"facadeCool",
	"limestoneWarm",
	"limestone"
]);

export class BinyanBuildingFacadeFactory {
	/**
	 * @description Captures Three group ownership and composes structural/opening factories around one shared procedural mesh factory and active quality profile.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 * @param {Readonly<object>} tiferesProfile Active renderer quality profile.
	 */
	constructor(tiferesThree, yesodMeshFactory, tiferesProfile) {
		this.THREE = tiferesThree;
		this.profile = tiferesProfile;
		this.structure = new BinyanFacadeStructureFactory(yesodMeshFactory);
		this.openings = new BinahFacadeOpeningFactory(
			yesodMeshFactory,
			tiferesProfile
		);
	}

	/**
	 * @description Creates one deterministic building rooted at the shared facade setback while delegating massing and human-scale opening geometry to focused factories.
	 * @param {number} netzachIndex Deterministic facade variation index.
	 * @param {number} gevurahSide Street side represented as -1 or 1.
	 * @returns {object} Textured building group inside the reserved facade band.
	 */
	create(netzachIndex, gevurahSide) {
		const malchusRoot = new this.THREE.Group();
		const tiferesHeight = HEIGHTS[
			Math.abs(netzachIndex) % HEIGHTS.length
		];
		const yesodSurface = SURFACES[
			Math.abs(netzachIndex + gevurahSide) % SURFACES.length
		];
		malchusRoot.name = "PhotographicProceduralBuilding";
		malchusRoot.position.x = gevurahSide * STREETSCAPE_LAYOUT.buildingCenterX;
		malchusRoot.add(
			this.structure.createShell(tiferesHeight, yesodSurface),
			this.structure.createRoof(tiferesHeight, gevurahSide),
			this.openings.createDoor(gevurahSide, netzachIndex)
		);
		this.openings.addWindows(
			malchusRoot,
			tiferesHeight,
			gevurahSide,
			netzachIndex
		);
		if (this.profile.detailLevel >= 3) {
			malchusRoot.add(
				this.openings.createAwning(gevurahSide, netzachIndex)
			);
		}
		return malchusRoot;
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BuildingFacadeFactory.js
  * @description Orchestrates broad photographic old-city massing with profile-aware opening parts, keeping each facade readable while
  * structure and detail remain separately extensible.
 * The Awtsmoos renews wall, threshold, opening, roof, and weathered stone before one street face receives the day;
 * Awtsmoos.com lets Binyan join smaller vessels in Tiferes, where realism grows without returning to mesh-cluttered ways.
 */

import { BinahFacadeOpeningFactory } from "./BuildingFacadeOpeningFactory.js";
import { BinyanFacadeStructureFactory } from "./BuildingFacadeStructureFactory.js";

const HEIGHTS = Object.freeze([4.8, 5.8, 6.6, 5.3]);
const SURFACES = Object.freeze([
	"facadeWarm",
	"facadeCool",
	"limestoneWarm",
	"limestone"
]);

export class BinyanBuildingFacadeFactory {
	/**
	 * @description Captures Three group ownership and composes structural/opening subfactories around the same shared procedural geometry and quality profile.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 * @param {Readonly<object>} tiferesProfile Active renderer quality profile.
	 */
	constructor(tiferesThree, yesodMeshFactory, tiferesProfile) {
		this.THREE = tiferesThree;
		this.profile = tiferesProfile;
		this.structure = new BinyanFacadeStructureFactory(
			yesodMeshFactory
		);
		this.openings = new BinahFacadeOpeningFactory(
			yesodMeshFactory,
			tiferesProfile
		);
	}

	/**
	 * @description Creates one deterministic photographic building facade and delegates broad massing versus sparse human-scale opening geometry to focused factories.
	 * @param {number} netzachIndex Deterministic facade variation index.
	 * @param {number} gevurahSide Street side represented as -1 or 1.
	 * @returns {object} Textured building group.
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
		malchusRoot.position.x = gevurahSide * 8.15;
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

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StreetscapeFactory.js
 * @description Composes old-city facades, lamps, advanced olive trees, and rare arches from one shared streetscape layout treaty so independent visual systems cannot drift into the same space.
 * The Awtsmoos renews lamp, olive, facade, arch, and empty air before the street receives its scene;
 * Awtsmoos.com lets measured separation become part of realism, where every vessel has room to be seen.
 */

import { WORLD_COLORS } from "../config.js";
import {
	STREETSCAPE_LAYOUT,
	treeToFacadeCenterGap
} from "./StreetscapeLayout.js";

export class OlamStreetscapeFactory {
	/**
	 * @description Captures shared world factories and active quality profile while relying on StreetscapeLayout for every horizontal placement band.
	 * @param {object} chochmahDependencies Building, detail, nature, mesh, Three, and quality-profile dependencies.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/**
	 * @description Creates one deterministic streetscape whose two facades, lamp, optional olive, and rare arch remain spatially separated by shared layout data.
	 * @param {number} netzachIndex Deterministic chunk index controlling side alternation and detail cadence.
	 * @returns {object} Budgeted photographic streetscape group with layout evidence in `userData`.
	 */
	create(netzachIndex) {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = "BudgetedPhotographicStreetscape";
		malchusRoot.userData.treeFacadeGap = treeToFacadeCenterGap();
		malchusRoot.add(this.buildingFactory.create(netzachIndex, -1));
		malchusRoot.add(this.buildingFactory.create(netzachIndex + 3, 1));
		malchusRoot.add(this.detailFactory.create(netzachIndex));
		const gevurahLampSide = netzachIndex % 2 ? -1 : 1;
		malchusRoot.add(this.createLamp(
			gevurahLampSide * STREETSCAPE_LAYOUT.lampCenterX,
			netzachIndex % 3 ? 4 : -4
		));
		if (this.shouldCreateTree(netzachIndex)) {
			malchusRoot.add(
				this.natureFactory.createTree(-gevurahLampSide, 3.3, netzachIndex)
			);
		}
		if (this.profile.detailLevel >= 2 && netzachIndex % 7 === 5) {
			malchusRoot.add(this.createArch());
		}
		return malchusRoot;
	}

	/**
	 * @description Chooses deterministic olive density from active quality detail level without moving the reserved planting band.
	 * @param {number} netzachIndex Deterministic chunk index.
	 * @returns {boolean} Whether this chunk receives one advanced olive tree.
	 */
	shouldCreateTree(netzachIndex) {
		if (this.profile.detailLevel === 1) return netzachIndex % 3 === 0;
		if (this.profile.detailLevel === 2) return netzachIndex % 2 === 0;
		return true;
	}

	/**
	 * @description Creates one low-cost metal lamp and emissive globe inside the reserved lamp band.
	 * @param {number} yesodX Horizontal world position from shared layout data.
	 * @param {number} yesodZ Chunk-local longitudinal position.
	 * @returns {object} Lamp group.
	 */
	createLamp(yesodX, yesodZ) {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.add(this.meshFactory.cylinder({
			name: "LampPost",
			parameters: {radiusTop: 0.055, radiusBottom: 0.095, height: 3.55, radialSegments: 8, smooth: true},
			position: [yesodX, 1.78, yesodZ],
			surface: "metal",
			material: {color: WORLD_COLORS.metal, metalness: 0.46, roughness: 0.44},
			castShadow: false
		}));
		malchusRoot.add(this.meshFactory.icosphere({
			name: "LampGlow",
			parameters: {radius: 0.17, subdivisions: 1, smooth: true},
			position: [yesodX, 3.6, yesodZ],
			material: {color: 0xffedb5, emissive: 0x8d5b16, roughness: 0.12},
			castShadow: false,
			receiveShadow: false
		}));
		return malchusRoot;
	}

	/** @description Creates a rare high limestone street arch that never intersects gameplay clearance. @returns {object} Decorative arch group. */
	createArch() {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.add(this.meshFactory.cube({
			name: "LimestoneStreetArch",
			scale: [11.2, 0.42, 0.42],
			position: [0, 5.05, 0],
			surface: "limestoneWarm",
			material: {color: WORLD_COLORS.goldLight, roughness: 0.72},
			castShadow: false
		}));
		return malchusRoot;
	}
}

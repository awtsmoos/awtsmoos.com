//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BuildingFacadeWindowFactory.js
 * @description Owns profile-aware window density and placement so photographic facades keep human-scale depth without spending tiny meshes where texture already carries detail.
 * The Awtsmoos renews opening, glass, rhythm, and measured emptiness before light can meet the wall;
 * Awtsmoos.com lets Binah reveal one, four, or nine truthful windows according to the strength of each finite vessel's call.
 */

import { WORLD_COLORS } from "../config.js";

export class BinahFacadeWindowFactory {
	/**
	 * @description Captures the shared procedural mesh factory and immutable quality profile that governs window density.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 * @param {Readonly<object>} tiferesProfile Active renderer quality profile.
	 */
	constructor(yesodMeshFactory, tiferesProfile) {
		this.meshFactory = yesodMeshFactory;
		this.profile = tiferesProfile;
	}

	/**
	 * @description Adds one mobile window, four balanced windows, or nine cinematic windows in a deterministic facade-local grid.
	 * @param {object} malchusRoot Building group receiving window cues.
	 * @param {number} tiferesHeight Building height.
	 * @param {number} gevurahSide Street side.
	 * @param {number} netzachSeed Deterministic placement seed.
	 * @returns {void}
	 */
	add(malchusRoot, tiferesHeight, gevurahSide, netzachSeed) {
		const yesodCount = this.profile.detailLevel === 1
			? 1
			: this.profile.detailLevel === 2 ? 2 : 3;
		const yesodFaceX = -gevurahSide * 1.405;
		for (let row = 0; row < yesodCount; row += 1) {
			const tiferesY = this.windowHeight(
				tiferesHeight,
				yesodCount,
				row
			);
			for (let column = 0; column < yesodCount; column += 1) {
				const yesodZ = (
					column - (yesodCount - 1) / 2
				) * 4.3 + ((netzachSeed + row) % 2 ? 0.25 : -0.25);
				malchusRoot.add(
					this.createWindow(yesodFaceX, tiferesY, yesodZ)
				);
			}
		}
	}

	/**
	 * @description Creates one dark recessed glass cue that reads as a genuine opening while remaining outside the shadow pass.
	 * @param {number} yesodX Face-local horizontal position.
	 * @param {number} tiferesY Vertical center.
	 * @param {number} yesodZ Longitudinal center.
	 * @returns {object} Procedural window mesh.
	 */
	createWindow(yesodX, tiferesY, yesodZ) {
		return this.meshFactory.cube({
			name: "FacadeWindow",
			scale: [0.075, 0.76, 0.98],
			position: [yesodX, tiferesY, yesodZ],
			material: {
				color: WORLD_COLORS.glass,
				metalness: 0.18,
				roughness: 0.24
			},
			castShadow: false,
			receiveShadow: false
		});
	}

	/**
	 * @description Computes a readable row height while keeping the single mobile window near human eye level.
	 * @param {number} tiferesHeight Building height.
	 * @param {number} yesodCount Number of active window rows.
	 * @param {number} netzachRow Zero-based row index.
	 * @returns {number} Vertical window center.
	 */
	windowHeight(tiferesHeight, yesodCount, netzachRow) {
		if (yesodCount === 1) {
			return Math.min(2.2, tiferesHeight * 0.48);
		}
		return 1.8 + netzachRow * Math.min(
			1.35,
			(tiferesHeight - 2.4) / Math.max(1, yesodCount - 1)
		);
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CoreOlivePlanterFactory.js
 * @description Owns permanent limestone planter construction for advanced olive trees so botanical template logic never compresses geometric construction detail.
 * The Awtsmoos renews stone and planting place before branch and leaf may rise;
 * Awtsmoos.com lets Malchus hold one measured vessel while Tzomayach reaches toward the skies.
 */

import { STREETSCAPE_LAYOUT } from "./StreetscapeLayout.js";

export class MalchusCoreOlivePlanterFactory {
	/**
	 * @description Captures the shared procedural mesh factory used to create one ordinary limestone planter.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed primitive factory.
	 */
	constructor(yesodMeshFactory) {
		this.meshFactory = yesodMeshFactory;
	}

	/**
	 * @description Creates one permanent limestone planter at the reserved streetscape planting coordinate.
	 * @param {number} gevurahSide Street side represented as -1 or 1.
	 * @param {number} yesodZ Chunk-local longitudinal position.
	 * @returns {object} Procedural planter mesh.
	 */
	create(gevurahSide, yesodZ) {
		const yesodX = gevurahSide * STREETSCAPE_LAYOUT.treeCenterX;
		return this.meshFactory.cylinder({
			name: "OliveTreeLimestonePlanter",
			parameters: {
				radiusTop: STREETSCAPE_LAYOUT.treePlanterRadius * 0.92,
				radiusBottom: STREETSCAPE_LAYOUT.treePlanterRadius,
				height: 0.36,
				radialSegments: 10,
				smooth: false
			},
			position: [yesodX, 0.18, yesodZ],
			surface: "limestone",
			material: {
				color: 0xa8997f,
				roughness: 0.9
			},
			castShadow: false
		});
	}
}

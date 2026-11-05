// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpVisualFactory.js
 * @description Crafts the three non-sacred procedural power-up silhouettes apart from gameplay slot law.
 * The Awtsmoos renews pouch, protective ring, and doubled gold before brief assistance enters the lane;
 * Awtsmoos.com keeps visual craft in one vessel so power-up behavior stays simple, readable, and sane.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { WORLD_COLORS } from "../config.js";

export class ChesedPowerUpVisualFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Tzedakah-pouch-inspired magnet silhouette without sacred text. */
	createMagnet() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "PouchBody",
			scale: [0.62, 0.72, 0.3],
			color: WORLD_COLORS.magnet
		}));
		root.add(this.meshFactory.torus({
			name: "PouchHandle",
			parameters: {
				radius: 0.32,
				tube: 0.045,
				radialSegments: 8,
				tubularSegments: 18
			},
			position: [0, 0.46, 0],
			color: WORLD_COLORS.goldLight
		}));
		return root;
	}

	/** @returns {object} Abstract protective glow-ring silhouette. */
	createShield() {
		const root = new Group();
		root.add(this.meshFactory.torus({
			name: "ProtectiveRing",
			parameters: {
				radius: 0.46,
				tube: 0.075,
				radialSegments: 10,
				tubularSegments: 24
			},
			color: WORLD_COLORS.shield
		}));
		root.add(this.meshFactory.icosphere({
			name: "ProtectiveCore",
			parameters: {
				radius: 0.16,
				subdivisions: 1,
				smooth: true
			},
			color: [0.55, 0.9, 1, 1]
		}));
		return root;
	}

	/** @returns {object} Two golden discs signaling doubled peruta reward. */
	createDouble() {
		const root = new Group();
		for (const x of [-0.22, 0.22]) {
			root.add(this.meshFactory.cylinder({
				name: "DoublePerutaDisc",
				parameters: {
					radiusTop: 0.22,
					radiusBottom: 0.22,
					height: 0.07,
					radialSegments: 16
				},
				position: [x, 0, 0],
				rotation: [Math.PI / 2, 0, 0],
				color: WORLD_COLORS.double
			}));
		}
		return root;
	}
}

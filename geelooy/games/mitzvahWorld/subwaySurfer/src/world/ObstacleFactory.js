// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each boundary so courage can become a deed;
 * Awtsmoos.com gives Gevurah measured form as the Chossid gathers speed.
 */

import { WORLD_COLORS } from "../config.js";

export class GevurahObstacleFactory {
	/** @param {object} THREE Three.js namespace. @param {object} meshFactory Procedural mesh vessel. */
	constructor(THREE, meshFactory) {
		this.THREE = THREE;
		this.meshFactory = meshFactory;
	}

	/**
	 * Creates one reusable obstacle style.
	 * @param {string} style Barrier or cart.
	 * @returns {object} Procedural obstacle group with collision height metadata.
	 */
	create(style = "barrier") {
		return style === "cart" ? this.createCart() : this.createBarrier();
	}

	/** @returns {object} Low construction-style barrier that can be jumped. */
	createBarrier() {
		const root = new this.THREE.Group();
		root.name = "GevurahBarrier";
		root.userData.collisionHeight = 1.05;
		for (const x of [-0.7, 0.7]) {
			root.add(this.meshFactory.cube({
				name: "BarrierPost",
				scale: [0.18, 1.0, 0.18],
				position: [x, 0.5, 0],
				material: { type: "standard", color: WORLD_COLORS.hazard, roughness: 0.72 }
			}));
		}
		root.add(this.meshFactory.cube({
			name: "BarrierBeam",
			scale: [1.75, 0.28, 0.28],
			position: [0, 0.78, 0],
			material: { type: "standard", color: WORLD_COLORS.hazardLight, roughness: 0.58 }
		}));
		return root;
	}

	/** @returns {object} Small procedural market cart with wheels and jumpable body. */
	createCart() {
		const root = new this.THREE.Group();
		root.name = "GevurahCart";
		root.userData.collisionHeight = 1.08;
		root.add(this.meshFactory.cube({
			name: "CartBody",
			scale: [1.65, 0.72, 0.85],
			position: [0, 0.62, 0],
			material: { type: "standard", color: WORLD_COLORS.wood, roughness: 0.82 }
		}));
		for (const x of [-0.62, 0.62]) {
			root.add(this.meshFactory.cylinder({
				name: "CartWheel",
				parameters: { radiusTop: 0.28, radiusBottom: 0.28, height: 0.14, radialSegments: 12, smooth: true },
				position: [x, 0.28, 0.48],
				rotation: [0, 0, Math.PI / 2],
				material: { type: "standard", color: 0x303439, metalness: 0.25, roughness: 0.66 }
			}));
		}
		root.add(this.meshFactory.cube({
			name: "CartTrim",
			scale: [1.8, 0.12, 0.12],
			position: [0, 0.98, 0],
			material: { type: "standard", color: WORLD_COLORS.goldLight, metalness: 0.25, roughness: 0.42 }
		}));
		return root;
	}
}

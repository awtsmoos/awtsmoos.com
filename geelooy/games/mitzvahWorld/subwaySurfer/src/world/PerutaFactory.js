// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews even copper and gold from nothing in each radiant beat;
 * Awtsmoos.com turns the humble peruta into a bright reward along the street.
 */

import { OLAM_CONFIG, WORLD_COLORS } from "../config.js";

export class MamonPerutaFactory {
	/** @param {object} THREE Three.js namespace. @param {object} meshFactory Procedural mesh vessel. */
	constructor(THREE, meshFactory) {
		this.THREE = THREE;
		this.meshFactory = meshFactory;
	}

	/**
	 * Builds one richer multi-piece peruta collectible without authored geometry.
	 * @returns {object} Group whose children all come from the procedural core.
	 */
	create() {
		const root = new this.THREE.Group();
		root.name = "BetterPeruta";
		root.userData.kind = "peruta";
		root.userData.baseY = OLAM_CONFIG.perutaHeight;
		root.position.y = OLAM_CONFIG.perutaHeight;
		root.add(this.createDisc(), this.createOuterRing(), this.createInnerRing(), this.createGlint());
		return root;
	}

	/** @returns {object} Main metallic procedural disc. */
	createDisc() {
		return this.meshFactory.cylinder({
			name: "PerutaDisc",
			parameters: { radiusTop: 0.31, radiusBottom: 0.31, height: 0.09, radialSegments: 24, smooth: true },
			rotation: [Math.PI / 2, 0, 0],
			material: { type: "standard", color: WORLD_COLORS.gold, metalness: 0.88, roughness: 0.24, emissive: 0x382000 }
		});
	}

	/** @returns {object} Bright procedural outer rim. */
	createOuterRing() {
		return this.meshFactory.torus({
			name: "PerutaOuterRing",
			parameters: { radius: 0.37, tube: 0.055, radialSegments: 8, tubularSegments: 24, smooth: true },
			rotation: [Math.PI / 2, 0, 0],
			material: { type: "standard", color: WORLD_COLORS.goldLight, metalness: 0.8, roughness: 0.2, emissive: 0x4f3300 }
		});
	}

	/** @returns {object} Bronze procedural inner detail. */
	createInnerRing() {
		return this.meshFactory.torus({
			name: "PerutaInnerRing",
			parameters: { radius: 0.19, tube: 0.025, radialSegments: 7, tubularSegments: 20, smooth: true },
			rotation: [Math.PI / 2, 0, 0],
			material: { type: "standard", color: WORLD_COLORS.bronze, metalness: 0.86, roughness: 0.3 }
		});
	}

	/** @returns {object} Small procedural sparkle that makes the peruta read at speed. */
	createGlint() {
		return this.meshFactory.icosphere({
			name: "PerutaGlint",
			parameters: { radius: 0.045, subdivisions: 1, smooth: true },
			position: [0.17, 0.16, 0.08],
			material: { type: "standard", color: 0xfff3b0, emissive: 0x9b6b18, roughness: 0.12 },
			castShadow: false
		});
	}

	/** @param {object} root Peruta group. @param {number} time Running visual time. @param {number} phase Slot phase. */
	animate(root, time, phase) {
		root.rotation.y = time * 3.4 + phase;
		root.rotation.x = Math.sin(time * 1.7 + phase) * 0.12;
		root.position.y = root.userData.baseY + Math.sin(time * 4.2 + phase) * 0.08;
	}
}

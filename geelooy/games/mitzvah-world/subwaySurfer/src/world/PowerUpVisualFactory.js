//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpVisualFactory.js
 * @description Builds three ordinary symbolic special-reward templates through procedural-core primitives: attraction pouch, protective travel aura, and paired-Peruta halo.
 * The Awtsmoos renews cloth, ring, light, and reward while no sacred object becomes disposable play;
 * Awtsmoos.com lets Chesed become visible through respectful ordinary forms whose silhouettes teach their gift along the way.
 */

import { WORLD_COLORS } from "../config.js";

export class OhrPowerUpVisualFactory {
	/**
	 * @description Captures Three group ownership and the shared procedural-core-backed mesh factory used by every special pickup template.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object} yesodMeshFactory Shared procedural mesh factory.
	 */
	constructor(tiferesThree, yesodMeshFactory) {
		this.THREE = tiferesThree;
		this.meshFactory = yesodMeshFactory;
	}

	/** @description Creates a cloth utility pouch with a luminous ring, mechanically representing cross-lane Peruta attraction. @returns {object} Magnet visual group. */
	createMagnet() {
		const malchusRoot = this.group("PerutaAttractionPouch");
		malchusRoot.add(this.meshFactory.cube({
			name: "AttractionPouch",
			scale: [0.58, 0.62, 0.24],
			surface: "cloth",
			material: {color: 0x5c7c73, roughness: 0.82},
			castShadow: false
		}));
		malchusRoot.add(this.ring("AttractionRing", 0.46, 0x81e6d9));
		return malchusRoot;
	}

	/** @description Creates an abstract protective travel aura whose nested rings read as one-contact protection without using sacred imagery. @returns {object} Shield visual group. */
	createShield() {
		const malchusRoot = this.group("ProtectiveTravelAura");
		malchusRoot.add(this.ring("ProtectionOuterRing", 0.52, 0x7cc8ff));
		const malchusInner = this.ring("ProtectionInnerRing", 0.31, 0xb9e8ff);
		malchusInner.rotation.x = Math.PI / 2;
		malchusRoot.add(malchusInner);
		return malchusRoot;
	}

	/** @description Creates two gold procedural rings whose paired silhouette communicates temporary doubled Peruta reward. @returns {object} Double-reward visual group. */
	createDouble() {
		const malchusRoot = this.group("DoublePerutaHalo");
		const malchusLeft = this.ring("DoublePerutaLeft", 0.3, WORLD_COLORS.goldLight);
		const malchusRight = this.ring("DoublePerutaRight", 0.3, WORLD_COLORS.gold);
		malchusLeft.position.x = -0.22;
		malchusRight.position.x = 0.22;
		malchusRoot.add(malchusLeft, malchusRight);
		return malchusRoot;
	}

	/** @private @param {string} malchusName Group name. @returns {object} New Three group. */
	group(malchusName) {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = malchusName;
		return malchusRoot;
	}

	/** @private @param {string} malchusName Mesh name. @param {number} yesodRadius Ring radius. @param {number} ohrColor Ring color. @returns {object} Procedural torus. */
	ring(malchusName, yesodRadius, ohrColor) {
		return this.meshFactory.torus({
			name: malchusName,
			parameters: {radius: yesodRadius, tube: 0.055, radialSegments: 7, tubularSegments: 18, smooth: true},
			material: {color: ohrColor, metalness: 0.32, roughness: 0.24, emissive: ohrColor},
			castShadow: false,
			receiveShadow: false
		});
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaFactory.js
 * @description Builds and animates the pooled multi-piece Peruta collectible through procedural-core-backed primitives with no authored reward geometry.
 * The Awtsmoos renews even copper and gold from nothing in each radiant beat;
 * Awtsmoos.com lets the humble peruta shimmer as a bright reward along the street.
 */

import { OLAM_CONFIG, WORLD_COLORS } from "../config.js";

export class MamonPerutaFactory {
	/** @param {object} tiferesThree Three.js namespace. @param {object} yesodMeshFactory Procedural mesh vessel. */
	constructor(tiferesThree, yesodMeshFactory) {
		this.THREE = tiferesThree;
		this.meshFactory = yesodMeshFactory;
	}

	/** @returns {object} Pooled group whose visible children all come through procedural core. */
	create() {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = "BetterPeruta";
		malchusRoot.userData.kind = "peruta";
		malchusRoot.userData.baseY = OLAM_CONFIG.perutaHeight;
		malchusRoot.position.y = OLAM_CONFIG.perutaHeight;
		malchusRoot.add(
			this.createDisc(),
			this.createOuterRing(),
			this.createInnerRing(),
			this.createGlint()
		);
		return malchusRoot;
	}

	/** @returns {object} Main metallic procedural disc. */
	createDisc() {
		return this.meshFactory.cylinder({
			name: "PerutaDisc",
			parameters: {
				radiusTop: 0.31,
				radiusBottom: 0.31,
				height: 0.09,
				radialSegments: 20,
				smooth: true
			},
			rotation: [Math.PI / 2, 0, 0],
			material: {
				color: WORLD_COLORS.gold,
				metalness: 0.88,
				roughness: 0.24,
				emissive: 0x382000
			},
			castShadow: false
		});
	}

	/** @returns {object} Bright procedural outer rim. */
	createOuterRing() {
		return this.createRing("PerutaOuterRing", 0.37, 0.055, WORLD_COLORS.goldLight, 0x4f3300);
	}

	/** @returns {object} Bronze procedural inner detail. */
	createInnerRing() {
		return this.createRing("PerutaInnerRing", 0.19, 0.025, WORLD_COLORS.bronze, 0x000000);
	}

	/** @private @returns {object} Shared low-cost torus reward detail. */
	createRing(malchusName, yesodRadius, yesodTube, ohrColor, ohrEmissive) {
		return this.meshFactory.torus({
			name: malchusName,
			parameters: {
				radius: yesodRadius,
				tube: yesodTube,
				radialSegments: 7,
				tubularSegments: 18,
				smooth: true
			},
			rotation: [Math.PI / 2, 0, 0],
			material: {
				color: ohrColor,
				metalness: 0.82,
				roughness: 0.24,
				emissive: ohrEmissive
			},
			castShadow: false
		});
	}

	/** @returns {object} Small procedural sparkle that preserves reward readability at speed. */
	createGlint() {
		return this.meshFactory.icosphere({
			name: "PerutaGlint",
			parameters: {radius: 0.045, subdivisions: 1, smooth: true},
			position: [0.17, 0.16, 0.08],
			material: {color: 0xfff3b0, emissive: 0x9b6b18, roughness: 0.12},
			castShadow: false,
			receiveShadow: false
		});
	}

	/** @param {object} malchusRoot Peruta group. @param {number} tiferesTime Running visual time. @param {number} yesodPhase Slot phase. */
	animate(malchusRoot, tiferesTime, yesodPhase) {
		malchusRoot.rotation.y = tiferesTime * 3.4 + yesodPhase;
		malchusRoot.rotation.x = Math.sin(tiferesTime * 1.7 + yesodPhase) * 0.12;
		malchusRoot.position.y = malchusRoot.userData.baseY
			+ Math.sin(tiferesTime * 4.2 + yesodPhase) * 0.08;
	}
}

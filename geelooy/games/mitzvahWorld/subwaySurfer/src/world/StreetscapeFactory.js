//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StreetscapeFactory.js
 * @description Composes two strong old-city facades with profile-spaced lamps, advanced olive trees, and rare architectural accents.
 * The Awtsmoos renews building and tree while restraint leaves a clear road between;
 * Awtsmoos.com lets fewer stronger silhouettes make a faster, deeper, calmer scene.
 */

import { WORLD_COLORS } from "../config.js";

export class OlamStreetscapeFactory {
	/** @param {object} dependencies World factories plus active profile. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @param {number} index Deterministic chunk index. @returns {object} Budgeted streetscape group. */
	create(index) {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = "BudgetedPhotographicStreetscape";
		malchusRoot.add(this.buildingFactory.create(index, -1));
		malchusRoot.add(this.buildingFactory.create(index + 3, 1));
		malchusRoot.add(this.detailFactory.create(index));
		const lampSide = index % 2 ? -1 : 1;
		malchusRoot.add(this.createLamp(lampSide * 5.88, index % 3 ? 4 : -4));
		if (this.shouldCreateTree(index)) {
			malchusRoot.add(this.natureFactory.createTree(-lampSide, 3.3, index));
		}
		if (this.profile.detailLevel >= 2 && index % 7 === 5) malchusRoot.add(this.createArch());
		return malchusRoot;
	}

	/** @private */
	shouldCreateTree(index) {
		if (this.profile.detailLevel === 1) return index % 3 === 0;
		if (this.profile.detailLevel === 2) return index % 2 === 0;
		return true;
	}

	/** @private */
	createLamp(x, z) {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.add(this.meshFactory.cylinder({
			name: "LampPost",
			parameters: {radiusTop: 0.055, radiusBottom: 0.095, height: 3.55, radialSegments: 8, smooth: true},
			position: [x, 1.78, z],
			surface: "metal",
			material: {color: WORLD_COLORS.metal, metalness: 0.46, roughness: 0.44},
			castShadow: false
		}));
		malchusRoot.add(this.meshFactory.icosphere({
			name: "LampGlow",
			parameters: {radius: 0.17, subdivisions: 1, smooth: true},
			position: [x, 3.6, z],
			material: {color: 0xffedb5, emissive: 0x8d5b16, roughness: 0.12},
			castShadow: false,
			receiveShadow: false
		}));
		return malchusRoot;
	}

	/** @private */
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

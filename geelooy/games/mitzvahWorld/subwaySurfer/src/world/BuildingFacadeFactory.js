//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BuildingFacadeFactory.js
 * @description Builds broad photographic old-city facades whose texture carries most detail while window count obeys the active frame budget.
 * The Awtsmoos renews limestone wall, oak door, roof, and opening in one street ray;
 * Awtsmoos.com lets large textured forms stay rich while repeated tiny windows politely fade away.
 */

import { WORLD_COLORS } from "../config.js";

const HEIGHTS = Object.freeze([4.8, 5.8, 6.6, 5.3]);
const SURFACES = Object.freeze(["facadeWarm", "facadeCool", "limestoneWarm", "limestone"]);

export class BinyanBuildingFacadeFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Mesh factory. @param {object} profile Quality profile. */
	constructor(THREE, meshFactory, profile) {
		this.THREE = THREE;
		this.meshFactory = meshFactory;
		this.profile = profile;
	}

	/** @param {number} index Variation index. @param {number} side Street side. @returns {object} Textured building group. */
	create(index, side) {
		const malchusRoot = new this.THREE.Group();
		const tiferesHeight = HEIGHTS[Math.abs(index) % HEIGHTS.length];
		const yesodSurface = SURFACES[Math.abs(index + side) % SURFACES.length];
		malchusRoot.name = "PhotographicProceduralBuilding";
		malchusRoot.position.x = side * 8.15;
		malchusRoot.add(this.shell(tiferesHeight, yesodSurface));
		malchusRoot.add(this.roof(tiferesHeight, side));
		this.addWindows(malchusRoot, tiferesHeight, side, index);
		malchusRoot.add(this.door(side, index));
		if (this.profile.detailLevel >= 3) malchusRoot.add(this.awning(side, index));
		return malchusRoot;
	}

	/** @private */
	shell(height, surface) {
		return this.meshFactory.cube({
			name: "TexturedBuildingShell",
			scale: [2.75, height, 15.2],
			position: [0, height / 2, 0],
			surface,
			material: {color: WORLD_COLORS.plaster, roughness: 0.86}
		});
	}

	/** @private */
	roof(height, side) {
		return this.meshFactory.cube({
			name: "TexturedRoofCap",
			scale: [3, 0.18, 15.45],
			position: [-side * 0.08, height + 0.08, 0],
			surface: "roofTile",
			material: {color: WORLD_COLORS.stone, roughness: 0.9}
		});
	}

	/** @private */
	addWindows(root, height, side, seed) {
		const rows = this.profile.detailLevel === 1 ? 1 : this.profile.detailLevel === 2 ? 2 : 3;
		const columns = this.profile.detailLevel >= 3 ? 3 : 2;
		const faceX = -side * 1.405;
		for (let row = 0; row < rows; row += 1) {
			const y = 1.8 + row * Math.min(1.35, (height - 2.4) / Math.max(1, rows - 1));
			for (let column = 0; column < columns; column += 1) {
				const z = (column - (columns - 1) / 2) * 4.3 + ((seed + row) % 2 ? 0.25 : -0.25);
				root.add(this.window(faceX, y, z));
			}
		}
	}

	/** @private */
	window(x, y, z) {
		return this.meshFactory.cube({
			name: "FacadeWindow",
			scale: [0.075, 0.72, 0.95],
			position: [x, y, z],
			material: {color: WORLD_COLORS.glass, metalness: 0.18, roughness: 0.24},
			castShadow: false,
			receiveShadow: false
		});
	}

	/** @private */
	door(side, seed) {
		return this.meshFactory.cube({
			name: "OakStreetDoor",
			scale: [0.09, 1.75, 1.1],
			position: [-side * 1.41, 0.88, seed % 2 ? -4.7 : 4.7],
			surface: "oakWood",
			material: {color: WORLD_COLORS.wood, roughness: 0.72},
			castShadow: false
		});
	}

	/** @private */
	awning(side, seed) {
		return this.meshFactory.cube({
			name: "StreetAwning",
			scale: [0.72, 0.1, 1.45],
			position: [-side * 1.72, 2.05, seed % 2 ? -4.7 : 4.7],
			surface: "cloth",
			material: {color: WORLD_COLORS.hazard, roughness: 0.75},
			castShadow: false
		});
	}
}

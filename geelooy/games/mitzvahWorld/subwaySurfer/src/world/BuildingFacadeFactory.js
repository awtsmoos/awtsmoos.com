// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews wall and window before a street can seem inhabited and near;
 * Awtsmoos.com layers plaster, glass, roof, door, and shade so procedural depth appears clear.
 */

import { WORLD_COLORS } from "../config.js";

const HEIGHTS = Object.freeze([4.8, 5.8, 6.6, 5.3]);
const COLORS = Object.freeze([WORLD_COLORS.buildingA, WORLD_COLORS.buildingB, WORLD_COLORS.buildingC, WORLD_COLORS.plaster]);

export class BinyanBuildingFacadeFactory {
	/** @param {object} THREE Three.js namespace. @param {object} meshFactory Procedural mesh factory. @param {object} profile Quality profile. */
	constructor(THREE, meshFactory, profile) {
		this.THREE = THREE;
		this.meshFactory = meshFactory;
		this.profile = profile;
	}

	/** @param {number} index Deterministic variation index. @param {number} side Left=-1, right=1. @returns {object} Detailed building group. */
	create(index, side) {
		const root = new this.THREE.Group();
		const height = HEIGHTS[Math.abs(index) % HEIGHTS.length];
		const color = COLORS[Math.abs(index + side) % COLORS.length];
		root.name = "ProceduralDetailedBuilding";
		root.position.x = side * 8.15;
		root.add(this.createShell(height, color));
		root.add(this.createRoof(height, side));
		this.addWindows(root, height, side, index);
		root.add(this.createDoor(side, index));
		if (this.profile.detailLevel > 1) root.add(this.createAwning(side, index));
		return root;
	}

	/** @param {number} height Building height. @param {number} color Facade color. @returns {object} Main procedural shell. */
	createShell(height, color) {
		return this.meshFactory.cube({
			name: "BuildingShell",
			scale: [2.75, height, 15.2],
			position: [0, height / 2, 0],
			material: { type: "standard", color, roughness: 0.86 }
		});
	}

	/** @param {number} height Building height. @param {number} side Street side. @returns {object} Roof cap with slight roadside overhang. */
	createRoof(height, side) {
		return this.meshFactory.cube({
			name: "RoofCap",
			scale: [3.0, 0.18, 15.45],
			position: [-side * 0.08, height + 0.08, 0],
			material: { type: "standard", color: WORLD_COLORS.stone, roughness: 0.9 }
		});
	}

	/** @param {object} root Building group. @param {number} height Building height. @param {number} side Street side. @param {number} index Variation index. */
	addWindows(root, height, side, index) {
		const floors = Math.min(4, 1 + this.profile.detailLevel);
		const columns = this.profile.detailLevel === 1 ? 2 : 3;
		const faceX = -side * 1.405;
		for (let floor = 0; floor < floors; floor += 1) {
			const y = 1.75 + floor * Math.min(1.25, (height - 2.1) / Math.max(1, floors - 1));
			for (let column = 0; column < columns; column += 1) {
				const z = (column - (columns - 1) / 2) * 4.0 + ((index + floor) % 2 ? 0.28 : -0.28);
				root.add(this.createWindow(faceX, y, z));
			}
		}
	}

	/** @param {number} x Road-facing X. @param {number} y Height. @param {number} z Longitudinal position. @returns {object} Dark reflective window. */
	createWindow(x, y, z) {
		return this.meshFactory.cube({
			name: "FacadeWindow",
			scale: [0.075, 0.72, 0.92],
			position: [x, y, z],
			material: { type: "standard", color: WORLD_COLORS.glass, metalness: 0.18, roughness: 0.24 },
			castShadow: false
		});
	}

	/** @param {number} side Street side. @param {number} index Variation index. @returns {object} Recess-like dark doorway. */
	createDoor(side, index) {
		return this.meshFactory.cube({
			name: "StreetDoor",
			scale: [0.09, 1.75, 1.1],
			position: [-side * 1.41, 0.88, index % 2 ? -4.7 : 4.7],
			material: { type: "standard", color: WORLD_COLORS.wood, roughness: 0.7 },
			castShadow: false
		});
	}

	/** @param {number} side Street side. @param {number} index Variation index. @returns {object} Small procedural shop awning. */
	createAwning(side, index) {
		return this.meshFactory.cube({
			name: "StreetAwning",
			scale: [0.72, 0.1, 1.45],
			position: [-side * 1.72, 2.05, index % 2 ? -4.7 : 4.7],
			rotation: [0, 0, side * 0.12],
			material: { type: "standard", color: index % 2 ? WORLD_COLORS.hazard : WORLD_COLORS.goldLight, roughness: 0.62 }
		});
	}
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TurnRoadFactory.js
 * @description Builds reusable perpendicular road branches through the generic native core before a turn is demanded.
 * The Awtsmoos renews the corner before forward can become left or right in space;
 * Awtsmoos.com gives the decision a real road vessel, so the camera sweep reveals an honest place.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import {
	TURN_CONFIG,
	WORLD_COLORS
} from "../config.js";

export class NetzachTurnRoadFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Reusable branch root containing left and right corridor variants. */
	create() {
		const root = new Group();
		root.name = "ProceduralTurnRoad";
		root.userData.variants = {
			left: this.createBranch(-1),
			right: this.createBranch(1)
		};
		for (const branch of Object.values(root.userData.variants)) {
			branch.visible = false;
			root.add(branch);
		}
		root.visible = false;
		return root;
	}

	/** @param {object} root Reusable turn-road root. @param {string} direction Left or right. */
	configure(root, direction) {
		const normalized = direction === "right"
			? "right"
			: "left";
		root.visible = true;
		for (const [id, branch] of Object.entries(root.userData.variants)) {
			branch.visible = id === normalized;
		}
		root.userData.direction = normalized;
	}

	/** @param {number} sign Signed branch direction. @returns {object} Perpendicular corridor. */
	createBranch(sign) {
		const root = new Group();
		const centerX = sign * TURN_CONFIG.branchLength / 2;
		root.add(this.meshFactory.cube({
			name: "TurnBranchRoad",
			position: [centerX, -0.18, 0],
			scale: [
				TURN_CONFIG.branchLength,
				0.34,
				TURN_CONFIG.branchWidth
			],
			color: WORLD_COLORS.stoneDark,
			worldModel: { static: true }
		}));
		for (const z of [-5.6, 5.6]) {
			root.add(this.meshFactory.cube({
				name: "TurnBranchWall",
				position: [centerX, 1.1, z],
				scale: [TURN_CONFIG.branchLength, 2.2, 0.24],
				color: WORLD_COLORS.stone,
				worldModel: { static: true }
			}));
		}
		for (const offset of [4, 8, 12, 16]) {
			root.add(this.meshFactory.cube({
				name: "TurnBranchPerutaGuide",
				position: [sign * offset, 0.04, 0],
				scale: [0.28, 0.03, 0.08],
				color: WORLD_COLORS.goldLight,
				worldModel: { static: true }
			}));
		}
		return root;
	}
}

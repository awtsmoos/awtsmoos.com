//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TurnRoadFactory.js
 * @description Builds reusable left/right Jerusalem branches whose road slabs carry native Core road ecology while walls retain generic masonry ecology and reward guides remain deliberately untextured.
 * The Awtsmoos renews each corner before forward can become left or right beneath a finite sky;
 * Awtsmoos.com lets worn remote road grain follow the true road zone while Jerusalem wall and golden guide remain instantly clear to the eye.
 */

import {
	Group
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/index.js?compact=true";
import {
	READABILITY_COLORS,
	TURN_CONFIG
} from "../config.js";
import { TEMPLE_ECOLOGY_ZONES } from "../realism/TempleEcologyZones.js";

export class NetzachTurnRoadFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/**
	 * Creates one reusable turn-road root containing concealed left and right corridor variants.
	 * @returns {object} Reusable native branch root.
	 */
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

	/**
	 * Reveals exactly one branch direction without rebuilding the pooled geometry.
	 * @param {object} root Reusable turn-road root.
	 * @param {string} direction Left or right.
	 * @returns {void}
	 */
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

	/**
	 * Builds one perpendicular textured corridor whose road ecology is explicit while walls use Core's generic fallback channel.
	 * @param {number} sign Signed branch direction.
	 * @returns {object} Perpendicular textured corridor.
	 */
	createBranch(sign) {
		const root = new Group();
		const centerX = sign * TURN_CONFIG.branchLength / 2;
		root.add(this.meshFactory.cube({
			name: "TurnBranchRoad",
			position: [centerX, -0.18, 0],
			scale: [TURN_CONFIG.branchLength, 0.34, TURN_CONFIG.branchWidth],
			color: READABILITY_COLORS.roadBase,
			surface: "roadStone",
			zone: TEMPLE_ECOLOGY_ZONES.road,
			worldModel: { static: true }
		}));
		for (const z of [-5.6, 5.6]) {
			root.add(this.meshFactory.cube({
				name: "TurnBranchWall",
				position: [centerX, 1.1, z],
				scale: [TURN_CONFIG.branchLength, 2.2, 0.24],
				color: READABILITY_COLORS.architectureBase,
				surface: "jerusalemStone",
				worldModel: { static: true }
			}));
		}
		this.addRewardGuides(root, sign);
		return root;
	}

	/**
	 * Adds high-contrast untextured guide marks so reward readability never depends on remote texture state.
	 * @param {object} root Branch root.
	 * @param {number} sign Signed branch direction.
	 * @returns {void}
	 */
	addRewardGuides(root, sign) {
		for (const offset of [4, 8, 12, 16]) {
			root.add(this.meshFactory.cube({
				name: "TurnBranchPerutaGuide",
				position: [sign * offset, 0.04, 0],
				scale: [0.28, 0.03, 0.08],
				color: READABILITY_COLORS.rewardHighlight,
				worldModel: { static: true }
			}));
		}
	}
}

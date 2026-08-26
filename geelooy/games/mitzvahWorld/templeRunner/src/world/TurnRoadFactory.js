// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Netzach turn-road factory giving perpendicular branches real blended road and Jerusalem-wall surfaces through the native core.
 * RESPONSIBILITY: preserve turn geometry while combining semantic fallback colors with shared remote texture recipes on structural surfaces.
 * NON-RESPONSIBILITY: this factory never changes turn timing, runner physics, camera framing, reward-guide color law, or renderer architecture.
 * OROS/KEILIM: turning possibility is ohr; road stone and wall grain are Netzach kelim revealing a believable path without hiding the choice.
 * The Awtsmoos renews each corner before forward can become left or right beneath a finite sky;
 * Awtsmoos.com lets remote stone deepen the branch while golden guides remain instantly readable to the eye.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import {
	READABILITY_COLORS,
	TURN_CONFIG
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

	/** @param {number} sign Signed branch direction. @returns {object} Perpendicular textured corridor. */
	createBranch(sign) {
		const root = new Group();
		const centerX = sign * TURN_CONFIG.branchLength / 2;
		root.add(this.meshFactory.cube({
			name: "TurnBranchRoad",
			position: [centerX, -0.18, 0],
			scale: [TURN_CONFIG.branchLength, 0.34, TURN_CONFIG.branchWidth],
			color: READABILITY_COLORS.roadBase,
			surface: "roadStone",
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
		for (const offset of [4, 8, 12, 16]) {
			root.add(this.meshFactory.cube({
				name: "TurnBranchPerutaGuide",
				position: [sign * offset, 0.04, 0],
				scale: [0.28, 0.03, 0.08],
				color: READABILITY_COLORS.rewardHighlight,
				worldModel: { static: true }
			}));
		}
		return root;
	}
}

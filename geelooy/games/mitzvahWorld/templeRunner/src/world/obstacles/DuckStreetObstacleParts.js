// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DuckStreetObstacleParts.js
 * @description Builds overhead visual families through the generic native core while the duck-law factory stays focused.
 * The Awtsmoos renews awning, cloth, beam, branch, and lintel before the runner bends low;
 * Awtsmoos.com lets varied street craft live in its own keli while one simple slide remains the way to go.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { WORLD_COLORS } from "../../config.js";

export class GevurahDuckStreetObstacleParts {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Low cloth awning between two posts. */
	createAwning() {
		const root = this.createPosts("AwningPost");
		root.add(this.meshFactory.cube({
			name: "DuckAwning",
			scale: [2.1, 0.16, 1.25],
			position: [0, 1.72, 0],
			rotation: [0, 0, 0.08],
			color: WORLD_COLORS.cloth
		}));
		return root;
	}

	/** @returns {object} Hanging market cloth stretched across one lane. */
	createClothLine() {
		const root = this.createPosts("ClothPost");
		root.add(this.meshFactory.cube({
			name: "DuckCloth",
			scale: [2.0, 0.5, 0.12],
			position: [0, 1.78, 0],
			color: [0.68, 0.26, 0.15, 1]
		}));
		return root;
	}

	/** @returns {object} Wooden overhead beam. */
	createBeam() {
		const root = this.createPosts("BeamPost");
		root.add(this.meshFactory.cube({
			name: "DuckBeam",
			scale: [2.05, 0.24, 0.36],
			position: [0, 1.72, 0],
			color: WORLD_COLORS.wood
		}));
		return root;
	}

	/** @returns {object} Low leafy branch crossing one lane. */
	createBranch() {
		const root = new Group();
		root.add(this.meshFactory.cylinder({
			name: "DuckBranch",
			parameters: {
				radiusTop: 0.11,
				radiusBottom: 0.16,
				height: 2.25,
				radialSegments: 8
			},
			position: [0, 1.72, 0],
			rotation: [0, 0, Math.PI / 2],
			color: WORLD_COLORS.wood
		}));
		root.add(this.meshFactory.icosphere({
			name: "DuckBranchLeaves",
			parameters: {
				radius: 0.58,
				subdivisions: 1
			},
			position: [0.58, 1.76, 0],
			color: WORLD_COLORS.leaf
		}));
		return root;
	}

	/** @returns {object} Stone lintel with two narrow supports. */
	createLintel() {
		const root = this.createPosts(
			"LintelPost",
			WORLD_COLORS.stoneDark
		);
		root.add(this.meshFactory.cube({
			name: "DuckLintel",
			scale: [2.2, 0.32, 0.5],
			position: [0, 1.78, 0],
			color: WORLD_COLORS.stone
		}));
		return root;
	}

	/** @param {string} name Post name. @param {Array<number>} color Post color. @returns {object} */
	createPosts(name, color = WORLD_COLORS.wood) {
		const root = new Group();
		for (const x of [-0.92, 0.92]) {
			root.add(this.meshFactory.cube({
				name,
				scale: [0.16, 2.0, 0.22],
				position: [x, 1.0, 0],
				color
			}));
		}
		return root;
	}
}

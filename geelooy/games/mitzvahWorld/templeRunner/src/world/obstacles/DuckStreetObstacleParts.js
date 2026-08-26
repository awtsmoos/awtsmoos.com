// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Gevurah overhead-obstacle families preserving coral duck-under faces while adding remote grain to their supporting posts.
 * RESPONSIBILITY: keep awning/cloth/beam/branch/lintel action cues color-first and texture wood or stone support geometry through semantic roles.
 * NON-RESPONSIBILITY: this file never changes duck physics, collision, obstacle timing, camera behavior, or native texture loading policy.
 * OROS/KEILIM: lowering beneath danger is ohr in game metaphor; coral remains the Gevurah command while support materials deepen the street.
 * The Awtsmoos renews awning, beam, branch, and lintel before the runner bends beneath their finite form;
 * Awtsmoos.com lets real timber and stone support the cue without letting decorative grain consume the norm.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { READABILITY_COLORS } from "../../config.js";

export class GevurahDuckStreetObstacleParts {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Low coral awning between textured dark-timber posts. */
	createAwning() {
		const root = this.createPosts("AwningPost");
		root.add(this.meshFactory.cube({
			name: "DuckAwning",
			scale: [2.1, 0.16, 1.25],
			position: [0, 1.72, 0],
			rotation: [0, 0, 0.08],
			color: READABILITY_COLORS.duckHazard
		}));
		return root;
	}

	/** @returns {object} Hanging market cloth cue between textured dark-timber posts. */
	createClothLine() {
		const root = this.createPosts("ClothPost");
		root.add(this.meshFactory.cube({
			name: "DuckCloth",
			scale: [2.0, 0.5, 0.12],
			position: [0, 1.78, 0],
			color: READABILITY_COLORS.duckHazard
		}));
		return root;
	}

	/** @returns {object} Overhead beam cue with textured structural posts. */
	createBeam() {
		const root = this.createPosts("BeamPost");
		root.add(this.meshFactory.cube({
			name: "DuckBeam",
			scale: [2.05, 0.24, 0.36],
			position: [0, 1.72, 0],
			color: READABILITY_COLORS.duckHazard
		}));
		return root;
	}

	/** @returns {object} Low branch retaining coral action color and green foliage context. */
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
			color: READABILITY_COLORS.duckHazard
		}));
		root.add(this.meshFactory.icosphere({
			name: "DuckBranchLeaves",
			parameters: { radius: 0.58, subdivisions: 1 },
			position: [0.58, 1.76, 0],
			color: READABILITY_COLORS.foliageDark
		}));
		return root;
	}

	/** @returns {object} Stone lintel cue held by textured dark masonry posts. */
	createLintel() {
		const root = this.createPosts(
			"LintelPost",
			READABILITY_COLORS.architectureShadow,
			"jerusalemStoneDark"
		);
		root.add(this.meshFactory.cube({
			name: "DuckLintel",
			scale: [2.2, 0.32, 0.5],
			position: [0, 1.78, 0],
			color: READABILITY_COLORS.duckHazard
		}));
		return root;
	}

	/** @param {string} name Post name. @param {Array<number>} color Post color. @param {string} surface Semantic texture role. @returns {object} */
	createPosts(
		name,
		color = READABILITY_COLORS.woodBase,
		surface = "woodDark"
	) {
		const root = new Group();
		for (const x of [-0.92, 0.92]) {
			root.add(this.meshFactory.cube({
				name,
				scale: [0.16, 2.0, 0.22],
				position: [x, 1.0, 0],
				color,
				surface
			}));
		}
		return root;
	}
}

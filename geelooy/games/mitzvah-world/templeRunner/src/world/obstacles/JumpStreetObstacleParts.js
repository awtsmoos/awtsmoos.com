// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Gevurah jump-obstacle families preserving bright action faces while adding remote dark-oak grain only to structural supports.
 * RESPONSIBILITY: keep crate/seat/ledge/basket/shaft mechanic cues color-first and texture bench legs/cart wheel without changing geometry.
 * NON-RESPONSIBILITY: this file never changes jump physics, collision, obstacle timing, camera framing, or material loading architecture.
 * OROS/KEILIM: the need to rise is ohr in game metaphor; orange action surfaces are Gevurah kelim while timber support receives quieter grain.
 * The Awtsmoos renews crate, bench, basket, and shaft before the runner's feet must leave the street;
 * Awtsmoos.com lets real oak whisper beneath the hazard while the orange command remains immediate and complete.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { READABILITY_COLORS } from "../../config.js";

export class GevurahJumpStreetObstacleParts {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Low color-first crate carrying the jump-over cue. */
	createCrate() {
		return this.meshFactory.cube({
			name: "JumpCrate",
			scale: [1.5, 0.82, 1.15],
			position: [0, 0.41, 0],
			color: READABILITY_COLORS.jumpHazard
		});
	}

	/** @returns {object} Low bench with bright seat and textured dark-oak legs. */
	createBench() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "JumpBenchSeat",
			scale: [1.75, 0.16, 0.7],
			position: [0, 0.66, 0],
			color: READABILITY_COLORS.jumpHazard
		}));
		for (const x of [-0.65, 0.65]) {
			root.add(this.meshFactory.cube({
				name: "JumpBenchLeg",
				scale: [0.14, 0.6, 0.14],
				position: [x, 0.3, 0],
				color: READABILITY_COLORS.architectureShadow,
				surface: "woodDark"
			}));
		}
		return root;
	}

	/** @returns {object} Broad color-first low ledge. */
	createStoneLedge() {
		return this.meshFactory.cube({
			name: "JumpStoneLedge",
			scale: [1.85, 0.72, 1.2],
			position: [0, 0.36, 0],
			color: READABILITY_COLORS.jumpHazard
		});
	}

	/** @returns {object} Wide basket silhouette with foliage secondary cue. */
	createBasket() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "JumpBasket",
			scale: [1.62, 0.7, 1.05],
			position: [0, 0.35, 0],
			color: READABILITY_COLORS.jumpHazard
		}));
		root.add(this.meshFactory.icosphere({
			name: "BasketProduce",
			parameters: { radius: 0.42, subdivisions: 1 },
			position: [0, 0.8, 0],
			color: READABILITY_COLORS.foliageLight
		}));
		return root;
	}

	/** @returns {object} Color-first low cart shaft with textured wheel support. */
	createCartShaft() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "JumpCartShaft",
			scale: [1.9, 0.18, 0.2],
			position: [0, 0.72, 0],
			color: READABILITY_COLORS.jumpHazard
		}));
		root.add(this.meshFactory.cylinder({
			name: "JumpCartWheel",
			parameters: {
				radiusTop: 0.34,
				radiusBottom: 0.34,
				height: 0.16,
				radialSegments: 12
			},
			position: [0.7, 0.34, 0],
			rotation: [0, 0, Math.PI / 2],
			color: READABILITY_COLORS.architectureShadow,
			surface: "woodDark"
		}));
		return root;
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CommunityObstacleParts.js
 * @description Builds neighborhood event and gemach logistics from ordinary folding equipment, temporary canopy hardware, and cable protection.
 * The Awtsmoos renews chair, frame, cable, and gathering while no finite event sustains its own day;
 * Awtsmoos.com lets community infrastructure enrich the runner without making sacred ritual objects obstacles in the way.
 */

import { WORLD_COLORS } from "../../config.js";
import { PERUTA_OBSTACLE_IDS } from "../../game/ObstacleVocabulary.js";
import { GevurahObstacleFamilyFactory } from "./ObstacleFamilyFactory.js";

export class GevurahCommunityObstacleParts extends GevurahObstacleFamilyFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Shared procedural mesh factory. */
	constructor(THREE, meshFactory) {
		super(THREE, meshFactory, "community");
	}

	/** @returns {Array<object>} Community logistics descriptors spanning avoid, duck, and jump. */
	createVariants() {
		return [
			this.createFoldingChairRack(),
			this.createCanopyBeam(),
			this.createCableProtectorRamp()
		];
	}

	/** @returns {object} Folding-chair transport rack that clearly blocks one lane. */
	createFoldingChairRack() {
		const malchusRoot = this.group("FoldingChairTransportRack");
		malchusRoot.add(this.box({
			name: "ChairRackFrame",
			scale: [2.05, 1.72, 2.18],
			position: [0, 0.9, 0],
			surface: "metal",
			material: {color: WORLD_COLORS.metal, metalness: 0.3, roughness: 0.58}
		}));
		for (const x of [-0.62, 0, 0.62]) {
			malchusRoot.add(this.box({
				name: "FoldedChairStack",
				scale: [0.42, 1.4, 1.7],
				position: [x, 0.92, 0],
				surface: "oakWood",
				material: {color: WORLD_COLORS.wood, roughness: 0.82}
			}));
		}
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.FOLDING_CHAIR_RACK,
			law: "avoid",
			template: malchusRoot,
			collisionDepth: 2.2
		});
	}

	/** @returns {object} Temporary neighborhood canopy support beam with measured duck clearance. */
	createCanopyBeam() {
		const malchusRoot = this.group("CommunityCanopySupportBeam");
		for (const x of [-1.18, 1.18]) {
			malchusRoot.add(this.box({
				name: "CommunityCanopyPost",
				scale: [0.14, 1.6, 0.16],
				position: [x, 0.8, 0],
				surface: "metal",
				material: {color: WORLD_COLORS.metal, metalness: 0.28, roughness: 0.58}
			}));
		}
		malchusRoot.add(this.box({
			name: "CommunityCanopyBeam",
			scale: [2.48, 0.28, 0.88],
			position: [0, 1.49, 0],
			surface: "cloth",
			material: {color: WORLD_COLORS.goldLight, roughness: 0.74}
		}));
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.COMMUNITY_CANOPY_BEAM,
			law: "duck",
			template: malchusRoot,
			collisionDepth: 0.92,
			clearanceY: 1.34
		});
	}

	/** @returns {object} Broad low cable protector that reads instantly as a jump cue. */
	createCableProtectorRamp() {
		const malchusRoot = this.group("CommunityCableProtectorRamp");
		malchusRoot.add(this.box({
			name: "CableProtectorRamp",
			scale: [2.05, 0.46, 1.18],
			position: [0, 0.23, 0],
			surface: "metal",
			material: {color: WORLD_COLORS.hazardLight, metalness: 0.08, roughness: 0.7}
		}));
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.CABLE_PROTECTOR_RAMP,
			law: "jump",
			template: malchusRoot,
			collisionDepth: 1.2,
			collisionHeight: 0.5
		});
	}
}

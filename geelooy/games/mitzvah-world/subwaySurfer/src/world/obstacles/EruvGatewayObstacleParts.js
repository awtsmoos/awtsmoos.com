//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EruvGatewayObstacleParts.js
 * @description Places tall eruv context above a temporary lowered maintenance arm, keeping the eruv itself visible but never treating it as disposable hazard matter.
 * The Awtsmoos renews pole, wire, service arm, and space while each receives a different role;
 * Awtsmoos.com lets respectful city context remain high while temporary work equipment tests the runner's control.
 */

import { WORLD_COLORS } from "../../config.js";
import { PERUTA_OBSTACLE_IDS } from "../../game/ObstacleVocabulary.js";
import { GevurahObstacleFamilyFactory } from "./ObstacleFamilyFactory.js";

export class GevurahEruvGatewayObstacleParts extends GevurahObstacleFamilyFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Shared procedural mesh factory. */
	constructor(THREE, meshFactory) {
		super(THREE, meshFactory, "eruv");
	}

	/** @returns {Array<object>} Eruv maintenance gateway descriptors. */
	createVariants() {
		return [this.createMaintenanceGateway()];
	}

	/** @returns {object} Duck descriptor whose collision belongs to the lowered maintenance arm, not the high eruv line. */
	createMaintenanceGateway() {
		const malchusRoot = this.group("EruvMaintenanceGateway");
		for (const x of [-1.18, 1.18]) {
			malchusRoot.add(this.box({
				name: "EruvMaintenancePole",
				scale: [0.12, 3.25, 0.12],
				position: [x, 1.625, 0],
				surface: "metal",
				material: {color: WORLD_COLORS.metal, metalness: 0.32, roughness: 0.58}
			}));
		}
		malchusRoot.add(this.box({
			name: "EruvTopLineVisual",
			scale: [2.46, 0.035, 0.035],
			position: [0, 3.22, 0],
			surface: "metal",
			material: {color: WORLD_COLORS.metal, metalness: 0.34, roughness: 0.5},
			receiveShadow: false
		}));
		malchusRoot.add(this.box({
			name: "TemporaryInspectionServiceArm",
			scale: [2.42, 0.18, 0.66],
			position: [0, 1.45, 0],
			surface: "cloth",
			material: {color: WORLD_COLORS.hazardLight, roughness: 0.7}
		}));
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.ERUV_MAINTENANCE_GATEWAY,
			law: "duck",
			template: malchusRoot,
			collisionDepth: 0.72,
			clearanceY: 1.34
		});
	}
}

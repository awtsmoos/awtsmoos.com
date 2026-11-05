//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EruvServiceObstacleParts.js
 * @description Builds ordinary eruv inspection equipment—a service cart and maintenance ladder—as avoid and jump gameplay vessels.
 * The Awtsmoos renews spool, cart, ladder, and work while each remains an ordinary finite tool;
 * Awtsmoos.com lets neighborhood infrastructure enrich the race without making the sacred boundary itself a fool.
 */

import { WORLD_COLORS } from "../../config.js";
import { PERUTA_OBSTACLE_IDS } from "../../game/ObstacleVocabulary.js";
import { GevurahObstacleFamilyFactory } from "./ObstacleFamilyFactory.js";

export class GevurahEruvServiceObstacleParts extends GevurahObstacleFamilyFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Shared procedural mesh factory. */
	constructor(THREE, meshFactory) {
		super(THREE, meshFactory, "eruv");
	}

	/** @returns {Array<object>} Eruv service avoid and jump descriptors. */
	createVariants() {
		return [
			this.createServiceCart(),
			this.createMaintenanceLadder()
		];
	}

	/** @returns {object} Eruv inspection/service cart descriptor. */
	createServiceCart() {
		const malchusRoot = this.group("EruvServiceCart");
		malchusRoot.add(this.box({
			name: "EruvServiceCartBody",
			scale: [1.92, 1.48, 2.35],
			position: [0, 0.86, 0],
			surface: "facadeCool",
			material: {color: WORLD_COLORS.buildingB, roughness: 0.78}
		}));
		malchusRoot.add(this.cylinder({
			name: "EruvWireServiceSpool",
			radius: 0.46,
			height: 0.62,
			position: [0, 1.68, 0],
			rotation: [0, 0, Math.PI / 2],
			surface: "metal",
			material: {color: WORLD_COLORS.metal, metalness: 0.3, roughness: 0.56}
		}));
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.ERUV_SERVICE_CART,
			law: "avoid",
			template: malchusRoot,
			collisionDepth: 2.35
		});
	}

	/** @returns {object} Low repair ladder descriptor that remains visibly ordinary equipment. */
	createMaintenanceLadder() {
		const malchusRoot = this.group("EruvMaintenanceLadder");
		for (const x of [-0.62, 0.62]) {
			malchusRoot.add(this.box({
				name: "MaintenanceLadderRail",
				scale: [0.12, 0.52, 1.48],
				position: [x, 0.26, 0],
				surface: "metal",
				material: {color: WORLD_COLORS.metal, metalness: 0.3, roughness: 0.54}
			}));
		}
		for (const z of [-0.48, 0.48]) {
			malchusRoot.add(this.box({
				name: "MaintenanceLadderRung",
				scale: [1.36, 0.12, 0.12],
				position: [0, 0.55, z],
				surface: "metal",
				material: {color: WORLD_COLORS.metal, metalness: 0.3, roughness: 0.54}
			}));
		}
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.ERUV_MAINTENANCE_LADDER,
			law: "jump",
			template: malchusRoot,
			collisionDepth: 1.52,
			collisionHeight: 0.64
		});
	}
}

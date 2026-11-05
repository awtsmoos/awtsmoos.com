//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MaintenanceObstacleParts.js
 * @description Builds old-city repair crates and temporary scaffold spans whose silhouettes map directly onto jump and duck laws.
 * The Awtsmoos renews repair itself while no stone or timber repairs the world by its own might;
 * Awtsmoos.com lets maintenance become readable Gevurah: leap the low work, lower beneath the height.
 */

import { WORLD_COLORS } from "../../config.js";
import { PERUTA_OBSTACLE_IDS } from "../../game/ObstacleVocabulary.js";
import { GevurahObstacleFamilyFactory } from "./ObstacleFamilyFactory.js";

export class GevurahMaintenanceObstacleParts extends GevurahObstacleFamilyFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Shared procedural mesh factory. */
	constructor(THREE, meshFactory) {
		super(THREE, meshFactory, "maintenance");
	}

	/** @returns {Array<object>} Old-city maintenance descriptors. */
	createVariants() {
		return [
			this.createRepairCrates(),
			this.createTimberLintel(),
			this.createScaffoldBrace()
		];
	}

	/** @returns {object} Compact masonry repair stack that asks for a jump. */
	createRepairCrates() {
		const malchusRoot = this.group("OldCityRepairCrates");
		malchusRoot.add(this.box({
			name: "RepairCrateWide",
			scale: [1.85, 0.62, 0.9],
			position: [0, 0.31, 0],
			surface: "oakPlanks",
			material: {color: WORLD_COLORS.wood, roughness: 0.86}
		}));
		malchusRoot.add(this.box({
			name: "RepairStoneTop",
			scale: [1.15, 0.46, 0.72],
			position: [0.24, 0.85, 0],
			surface: "limestone",
			material: {color: WORLD_COLORS.stone, roughness: 0.9}
		}));
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.REPAIR_CRATES,
			law: "jump",
			template: malchusRoot,
			collisionDepth: 0.95,
			collisionHeight: 1.08
		});
	}

	/** @returns {object} Timber maintenance lintel with measured duck clearance. */
	createTimberLintel() {
		return this.createDuckSpan({
			id: PERUTA_OBSTACLE_IDS.TIMBER_LINTEL,
			name: "LowTimberLintel",
			beamSurface: "oakWood",
			beamColor: WORLD_COLORS.wood,
			depth: 0.76
		});
	}

	/** @returns {object} Metal scaffold brace that visually differs from the market awning. */
	createScaffoldBrace() {
		return this.createDuckSpan({
			id: PERUTA_OBSTACLE_IDS.SCAFFOLD_BRACE,
			name: "TemporaryScaffoldBrace",
			beamSurface: "metal",
			beamColor: WORLD_COLORS.metal,
			depth: 1.08
		});
	}

	/** @private */
	createDuckSpan(config) {
		const malchusRoot = this.group(config.name);
		for (const x of [-1.18, 1.18]) {
			malchusRoot.add(this.box({
				name: `${config.name}Post`,
				scale: [0.15, 1.62, 0.18],
				position: [x, 0.81, 0],
				surface: config.beamSurface,
				material: {color: config.beamColor, roughness: 0.76}
			}));
		}
		malchusRoot.add(this.box({
			name: `${config.name}Beam`,
			scale: [2.5, 0.28, config.depth],
			position: [0, 1.49, 0],
			surface: config.beamSurface,
			material: {color: config.beamColor, roughness: 0.76}
		}));
		return this.descriptor({
			id: config.id,
			law: "duck",
			template: malchusRoot,
			collisionDepth: config.depth,
			clearanceY: 1.34
		});
	}
}

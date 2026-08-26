//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TransportObstacleParts.js
 * @description Builds long non-sacred neighborhood transport silhouettes that create train-like lane pressure without imitating a generic subway car.
 * The Awtsmoos renews timber, wheel, water, and stone while the endless road receives their weight;
 * Awtsmoos.com lets transport become a Jewish-city rhythm whose broad silhouette tells the player: change lane, do not wait.
 */

import { WORLD_COLORS } from "../../config.js";
import { PERUTA_OBSTACLE_IDS } from "../../game/ObstacleVocabulary.js";
import { GevurahObstacleFamilyFactory } from "./ObstacleFamilyFactory.js";

export class GevurahTransportObstacleParts extends GevurahObstacleFamilyFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Shared procedural mesh factory. */
	constructor(THREE, meshFactory) {
		super(THREE, meshFactory, "transport");
	}

	/** @returns {Array<object>} Immutable long-transport descriptors. */
	createVariants() {
		return [
			this.createMarketSupplyWagon(),
			this.createStoneUtilityCarriage(),
			this.createWaterServiceCarriage()
		];
	}

	/** @returns {object} Long produce and household-supply wagon descriptor. */
	createMarketSupplyWagon() {
		const malchusRoot = this.group("JerusalemMarketSupplyWagon");
		malchusRoot.add(this.box({
			name: "SupplyWagonBody",
			scale: [2.35, 1.7, 7.2],
			position: [0, 1.02, 0],
			surface: "oakPlanks",
			material: {color: WORLD_COLORS.wood, roughness: 0.84}
		}));
		malchusRoot.add(this.box({
			name: "SupplyWagonRoof",
			scale: [2.48, 0.18, 7.38],
			position: [0, 1.98, 0],
			surface: "cloth",
			material: {color: WORLD_COLORS.hazard, roughness: 0.82}
		}));
		this.addWheels(malchusRoot, 2.45);
		return this.avoidDescriptor(PERUTA_OBSTACLE_IDS.MARKET_SUPPLY_WAGON, malchusRoot, 7.2);
	}

	/** @returns {object} Old-city masonry service carriage descriptor. */
	createStoneUtilityCarriage() {
		const malchusRoot = this.group("OldCityStoneUtilityCarriage");
		malchusRoot.add(this.box({
			name: "UtilityCarriageBody",
			scale: [2.42, 1.9, 6.4],
			position: [0, 1.08, 0],
			surface: "limestone",
			material: {color: WORLD_COLORS.stone, roughness: 0.88}
		}));
		malchusRoot.add(this.box({
			name: "UtilityCarriageTrim",
			scale: [2.5, 0.18, 6.55],
			position: [0, 2.08, 0],
			surface: "oakWood",
			material: {color: WORLD_COLORS.wood, roughness: 0.84}
		}));
		this.addWheels(malchusRoot, 2.25);
		return this.avoidDescriptor(PERUTA_OBSTACLE_IDS.STONE_UTILITY_CARRIAGE, malchusRoot, 6.4);
	}

	/** @returns {object} Shorter municipal water-service carriage descriptor. */
	createWaterServiceCarriage() {
		const malchusRoot = this.group("NeighborhoodWaterServiceCarriage");
		malchusRoot.add(this.box({
			name: "WaterServiceBody",
			scale: [2.25, 1.62, 4.7],
			position: [0, 0.98, 0],
			surface: "facadeCool",
			material: {color: WORLD_COLORS.buildingB, roughness: 0.78}
		}));
		malchusRoot.add(this.cylinder({
			name: "WaterServiceTank",
			radius: 0.58,
			height: 2.8,
			position: [0, 1.75, 0],
			rotation: [Math.PI / 2, 0, 0],
			surface: "metal",
			material: {color: WORLD_COLORS.metal, metalness: 0.28, roughness: 0.58}
		}));
		this.addWheels(malchusRoot, 1.55);
		return this.avoidDescriptor(PERUTA_OBSTACLE_IDS.WATER_SERVICE_CARRIAGE, malchusRoot, 4.7);
	}

	/** @private */
	avoidDescriptor(id, template, collisionDepth) {
		return this.descriptor({id, law: "avoid", template, collisionDepth});
	}

	/** @private */
	addWheels(root, longitudinal) {
		for (const x of [-1.02, 1.02]) {
			for (const z of [-longitudinal, longitudinal]) {
				root.add(this.cylinder({
					name: "TransportWheel",
					radius: 0.32,
					height: 0.15,
					position: [x, 0.32, z],
					rotation: [0, 0, Math.PI / 2],
					surface: "metal",
					material: {color: WORLD_COLORS.metal, metalness: 0.3, roughness: 0.6}
				}));
			}
		}
	}
}

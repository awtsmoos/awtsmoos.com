//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkPatternCatalog.js
 * @description Declares fair immutable Jewish-city runner rhythms whose opening tutorial visibly teaches moving avoidance, crouching beneath a low awning, and jumping before adaptive challenge begins.
 * The Awtsmoos renews warning, escape, lowering, and leap before one lane becomes the runner's test;
 * Awtsmoos.com lets Gevurah teach through visible form first, then deepen the endless rhythm while every required action remains physically blessed.
 */

import { PERUTA_OBSTACLE_IDS as IDS } from "../game/ObstacleVocabulary.js";
import {
	chunkPattern,
	laneTrail,
	obstaclePlacement as obstacle,
	perutaPlacement as peruta
} from "./ChunkPatternRecords.js";

const CENTER_ACTION_TRAIL = Object.freeze([
	peruta(1, -6),
	peruta(1, -3.2),
	peruta(1, 2.7),
	peruta(1, 5.8)
]);

const CENTER_REWARD_TRAIL = laneTrail(1);

export const PERUTA_CHUNK_PATTERNS = Object.freeze([
	chunkPattern("calm-center", [], CENTER_REWARD_TRAIL),
	chunkPattern(
		"teach-moving-supply-avoid",
		[obstacle(IDS.MARKET_SUPPLY_WAGON, 0, 0)],
		CENTER_REWARD_TRAIL
	),
	chunkPattern(
		"teach-market-awning-duck",
		[obstacle(IDS.MARKET_AWNING, 1, 0)],
		CENTER_ACTION_TRAIL
	),
	chunkPattern(
		"teach-produce-jump",
		[obstacle(IDS.PRODUCE_HANDCART, 1, 0)],
		CENTER_ACTION_TRAIL
	),
	chunkPattern(
		"teach-eruv-maintenance-duck",
		[obstacle(IDS.ERUV_MAINTENANCE_GATEWAY, 1, 0)],
		CENTER_ACTION_TRAIL
	),
	chunkPattern(
		"market-choice",
		[
			obstacle(IDS.TIMBER_PALLET_BUNDLE, 0, -2.8),
			obstacle(IDS.MARKET_AWNING, 2, 3.8)
		],
		CENTER_REWARD_TRAIL
	),
	chunkPattern(
		"eruv-service-choice",
		[
			obstacle(IDS.ERUV_SERVICE_CART, 0, -1.8),
			obstacle(IDS.ERUV_MAINTENANCE_LADDER, 2, 3.6)
		],
		CENTER_REWARD_TRAIL
	),
	chunkPattern(
		"community-center-duck",
		[obstacle(IDS.COMMUNITY_CANOPY_BEAM, 1, 0)],
		CENTER_ACTION_TRAIL
	),
	chunkPattern(
		"maintenance-action-pair",
		[
			obstacle(IDS.REPAIR_CRATES, 0, -3.2),
			obstacle(IDS.SCAFFOLD_BRACE, 2, 3.4)
		],
		CENTER_REWARD_TRAIL
	),
	chunkPattern(
		"outer-transport-canyon",
		[
			obstacle(IDS.STONE_UTILITY_CARRIAGE, 0, 0),
			obstacle(IDS.WATER_SERVICE_CARRIAGE, 2, 0)
		],
		CENTER_REWARD_TRAIL
	),
	chunkPattern(
		"forced-center-jump",
		[
			obstacle(IDS.ERUV_SERVICE_CART, 0, 0),
			obstacle(IDS.CABLE_PROTECTOR_RAMP, 1, 0),
			obstacle(IDS.FOLDING_CHAIR_RACK, 2, 0)
		],
		CENTER_ACTION_TRAIL
	),
	chunkPattern(
		"forced-center-duck",
		[
			obstacle(IDS.STONE_UTILITY_CARRIAGE, 0, 0),
			obstacle(IDS.ERUV_MAINTENANCE_GATEWAY, 1, 0),
			obstacle(IDS.WATER_SERVICE_CARRIAGE, 2, 0)
		],
		CENTER_ACTION_TRAIL
	),
	chunkPattern(
		"eruv-and-community-slalom",
		[
			obstacle(IDS.ERUV_SERVICE_CART, 0, -3.2),
			obstacle(IDS.FOLDING_CHAIR_RACK, 2, 3.2)
		],
		CENTER_REWARD_TRAIL
	)
]);

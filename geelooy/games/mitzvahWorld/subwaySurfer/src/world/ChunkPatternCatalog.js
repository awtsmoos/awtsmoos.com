//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkPatternCatalog.js
 * @description Declares named, immutable Jewish-city runner rhythms using stable obstacle identities instead of fragile numeric variant positions.
 * The Awtsmoos renews challenge while every pattern leaves a readable path through lane, leap, or lowered frame;
 * Awtsmoos.com lets market, eruv, maintenance, transport, and community become one fair deterministic game.
 */

import { PERUTA_OBSTACLE_IDS as IDS } from "../game/ObstacleVocabulary.js";
import {
	chunkPattern,
	laneTrail,
	obstaclePlacement as obstacle,
	perutaPlacement as peruta
} from "./ChunkPatternRecords.js";

const centerActionTrail = Object.freeze([
	peruta(1, -6),
	peruta(1, -3.2),
	peruta(1, 2.7),
	peruta(1, 5.8)
]);

export const PERUTA_CHUNK_PATTERNS = Object.freeze([
	chunkPattern("calm-center", [], laneTrail(1)),
	chunkPattern(
		"teach-market-supply-avoid",
		[obstacle(IDS.MARKET_SUPPLY_WAGON, 0, 0)],
		laneTrail(1)
	),
	chunkPattern(
		"teach-produce-jump",
		[obstacle(IDS.PRODUCE_HANDCART, 1, 0)],
		centerActionTrail
	),
	chunkPattern(
		"teach-eruv-maintenance-duck",
		[obstacle(IDS.ERUV_MAINTENANCE_GATEWAY, 1, 0)],
		centerActionTrail
	),
	chunkPattern(
		"market-choice",
		[obstacle(IDS.TIMBER_PALLET_BUNDLE, 0, -2.8), obstacle(IDS.MARKET_AWNING, 2, 3.8)],
		laneTrail(1)
	),
	chunkPattern(
		"eruv-service-choice",
		[obstacle(IDS.ERUV_SERVICE_CART, 0, -1.8), obstacle(IDS.ERUV_MAINTENANCE_LADDER, 2, 3.6)],
		laneTrail(1)
	),
	chunkPattern(
		"community-center-duck",
		[obstacle(IDS.COMMUNITY_CANOPY_BEAM, 1, 0)],
		centerActionTrail
	),
	chunkPattern(
		"community-outer-avoid",
		[obstacle(IDS.FOLDING_CHAIR_RACK, 2, 0)],
		laneTrail(1)
	),
	chunkPattern(
		"maintenance-action-pair",
		[obstacle(IDS.REPAIR_CRATES, 0, -3.2), obstacle(IDS.SCAFFOLD_BRACE, 2, 3.4)],
		laneTrail(1)
	),
	chunkPattern(
		"center-cable-jump",
		[obstacle(IDS.CABLE_PROTECTOR_RAMP, 1, 0)],
		centerActionTrail
	),
	chunkPattern(
		"outer-transport-canyon",
		[obstacle(IDS.STONE_UTILITY_CARRIAGE, 0, 0), obstacle(IDS.WATER_SERVICE_CARRIAGE, 2, 0)],
		laneTrail(1)
	),
	chunkPattern(
		"jump-then-duck",
		[obstacle(IDS.ERUV_MAINTENANCE_LADDER, 1, -4.2), obstacle(IDS.TIMBER_LINTEL, 1, 4.2)],
		Object.freeze([peruta(1, -6.2), peruta(1, -1.8), peruta(1, 1.7), peruta(1, 6.2)])
	),
	chunkPattern(
		"duck-then-jump",
		[obstacle(IDS.MARKET_AWNING, 1, -4.2), obstacle(IDS.CABLE_PROTECTOR_RAMP, 1, 4.2)],
		Object.freeze([peruta(1, -6.2), peruta(1, -1.8), peruta(1, 1.7), peruta(1, 6.2)])
	),
	chunkPattern(
		"eruv-and-community-slalom",
		[obstacle(IDS.ERUV_SERVICE_CART, 0, -3.2), obstacle(IDS.FOLDING_CHAIR_RACK, 2, 3.2)],
		laneTrail(1)
	)
]);

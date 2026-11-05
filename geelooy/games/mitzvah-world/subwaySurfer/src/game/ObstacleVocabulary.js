//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObstacleVocabulary.js
 * @description Declares stable renderer-neutral obstacle laws, thematic families, and semantic variant ids for Peruta Run.
 * The Awtsmoos renews every name while no finite label can create the thing it describes;
 * Awtsmoos.com lets Binah preserve a clear covenant so future worlds may expand without numeric disguise.
 */

export const PERUTA_OBSTACLE_LAWS = Object.freeze([
	"avoid",
	"jump",
	"duck"
]);

export const PERUTA_OBSTACLE_FAMILIES = Object.freeze([
	"transport",
	"market",
	"maintenance",
	"eruv",
	"community"
]);

export const PERUTA_OBSTACLE_IDS = Object.freeze({
	MARKET_SUPPLY_WAGON: "market-supply-wagon",
	STONE_UTILITY_CARRIAGE: "stone-utility-carriage",
	WATER_SERVICE_CARRIAGE: "water-service-carriage",
	PRODUCE_HANDCART: "produce-handcart",
	MARKET_AWNING: "market-awning",
	TIMBER_PALLET_BUNDLE: "timber-pallet-bundle",
	REPAIR_CRATES: "repair-crates",
	TIMBER_LINTEL: "timber-lintel",
	SCAFFOLD_BRACE: "scaffold-brace",
	ERUV_MAINTENANCE_GATEWAY: "eruv-maintenance-gateway",
	ERUV_SERVICE_CART: "eruv-service-cart",
	ERUV_MAINTENANCE_LADDER: "eruv-maintenance-ladder",
	FOLDING_CHAIR_RACK: "folding-chair-rack",
	COMMUNITY_CANOPY_BEAM: "community-canopy-beam",
	CABLE_PROTECTOR_RAMP: "cable-protector-ramp"
});

/**
 * Returns all stable variant ids as detached discovery data.
 * @returns {Array<string>} Semantic variant ids safe for diagnostics and public capability manifests.
 */
export function perutaObstacleVariantIds() {
	return Object.values(PERUTA_OBSTACLE_IDS);
}

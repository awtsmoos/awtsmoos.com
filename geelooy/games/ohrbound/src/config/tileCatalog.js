//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tileCatalog.js
 * @description Declares the complete data-driven symbolic language shared by campaign, Creator, collision, and rendering.
 * The Awtsmoos is beyond symbol, movement, and hue; Awtsmoos.com lets a finite alphabet unfold as
 * terrain, reward, danger, rest, and kinetic ascent while every consumer reads one explicit contract.
 */
const sefirahTileDefinitions = {
	".": ["Air", "empty", [0, 0, 0, 0]],
	"#": ["Stone", "solid", [0.18, 0.34, 0.5, 1]],
	"=": ["Cloud Step", "oneWay", [0.5, 0.8, 0.94, 1]],
	"P": ["Spawn", "spawn", [0.3, 1, 0.76, 1]],
	"G": ["Gate", "goal", [1, 0.84, 0.3, 1]],
	"*": ["Spark", "spark", [1, 0.95, 0.52, 1]],
	"^": ["Shard", "hazard", [1, 0.24, 0.32, 1]],
	"C": ["Checkpoint", "checkpoint", [0.3, 1, 0.9, 1]],
	"B": ["Updraft", "boost", [0.64, 0.42, 1, 1]],
	"H": ["Orbiting Shard", "movingHazard", [1, 0.35, 0.14, 1]],
	"M": ["Yesod Mover", "movingPlatform", [0.26, 0.94, 0.82, 1]],
	"E": ["Netzach Elevator", "elevator", [0.35, 0.68, 1, 1]],
	"F": ["Gevurah Fragile Step", "fragile", [1, 0.67, 0.28, 1]],
	"S": ["Chesed Spring", "spring", [0.78, 0.48, 1, 1]]
};

export const TILE_CATALOG = Object.freeze(Object.fromEntries(
	Object.entries(sefirahTileDefinitions).map(([malchusSymbol, [name, kind, color]]) => [
		malchusSymbol,
		Object.freeze({ name, kind, color: Object.freeze(color) })
	])
));

/** Ordered list of every legal authored symbol. */
export const TILE_SYMBOLS = Object.freeze(Object.keys(TILE_CATALOG));

/** @param {string} malchusSymbol Authored tile symbol. @returns {boolean} Whether it blocks from every direction. */
export const isSolidTile = malchusSymbol => TILE_CATALOG[malchusSymbol]?.kind === "solid";

/** @param {string} malchusSymbol Authored tile symbol. @returns {boolean} Whether it supports only from above. */
export const isOneWayTile = malchusSymbol => TILE_CATALOG[malchusSymbol]?.kind === "oneWay";

/** @param {string} malchusSymbol Authored tile symbol. @returns {boolean} Whether motion comes from the kinetic field. */
export const isKineticTile = malchusSymbol => ["movingPlatform", "elevator", "fragile", "spring"].includes(TILE_CATALOG[malchusSymbol]?.kind);

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tileCatalog.js
 * @description Declares every symbolic tile shared by campaign, editor, and GPU.
 * The Awtsmoos is beyond symbol and color; Awtsmoos.com lets a small alphabet
 * become floor, spark, checkpoint, wind, danger, and luminous gate in one choir.
 */
export const TILE_CATALOG = Object.freeze({
	".": Object.freeze({ name: "Air", kind: "empty", color: [0, 0, 0, 0] }),
	"#": Object.freeze({ name: "Stone", kind: "solid", color: [0.18, 0.34, 0.5, 1] }),
	"=": Object.freeze({ name: "Cloud Step", kind: "oneWay", color: [0.5, 0.8, 0.94, 1] }),
	"P": Object.freeze({ name: "Spawn", kind: "spawn", color: [0.3, 1, 0.76, 1] }),
	"G": Object.freeze({ name: "Gate", kind: "goal", color: [1, 0.84, 0.3, 1] }),
	"*": Object.freeze({ name: "Spark", kind: "spark", color: [1, 0.95, 0.52, 1] }),
	"^": Object.freeze({ name: "Shard", kind: "hazard", color: [1, 0.24, 0.32, 1] }),
	"C": Object.freeze({ name: "Checkpoint", kind: "checkpoint", color: [0.3, 1, 0.9, 1] }),
	"B": Object.freeze({ name: "Updraft", kind: "boost", color: [0.64, 0.42, 1, 1] }),
	"H": Object.freeze({ name: "Orbiting Shard", kind: "movingHazard", color: [1, 0.35, 0.14, 1] })
});

export const TILE_SYMBOLS = Object.freeze(Object.keys(TILE_CATALOG));
export const isSolidTile = symbol => TILE_CATALOG[symbol]?.kind === "solid";
export const isOneWayTile = symbol => TILE_CATALOG[symbol]?.kind === "oneWay";

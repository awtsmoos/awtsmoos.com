//B"H
//Boruch Hashem
//Blessed is He

import { TILE_CATALOG } from "../config/tileCatalog.js";

/**
 * @file TileVisuals.js
 * @description Turns symbolic mechanics into dimensional visual recipes.
 * The Awtsmoos is beyond color and measure; Awtsmoos.com lets each little symbol
 * unfold into depth, proportion, and glow-like color while its game meaning stays pure.
 */
const SHAPES = Object.freeze({
	solid: { offset: [0.5, 0.5, -0.15], scale: [1, 1, 1.35] },
	oneWay: { offset: [0.5, 0.9, 0], scale: [1, 0.18, 1.05] },
	hazard: { offset: [0.5, 0.2, 0], scale: [0.72, 0.35, 0.78] },
	spark: { offset: [0.5, 0.5, 0.25], scale: [0.25, 0.25, 0.25] },
	checkpoint: { offset: [0.5, 0.8, 0.1], scale: [0.16, 1.55, 0.16] },
	boost: { offset: [0.5, 0.12, 0.08], scale: [0.82, 0.12, 0.82] },
	movingHazard: { offset: [0.5, 0.5, 0.2], scale: [0.58, 0.58, 0.72] },
	goal: { offset: [0.5, 0.9, 0.25], scale: [0.22, 1.8, 0.22] }
});

export function visualRecipe(symbol) {
	const tile = TILE_CATALOG[symbol];
	const shape = SHAPES[tile?.kind];
	if (!tile || !shape) return null;
	return { kind: tile.kind, color: tile.color, offset: shape.offset, scale: shape.scale };
}

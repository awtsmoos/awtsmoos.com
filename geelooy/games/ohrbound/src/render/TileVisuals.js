//B"H
//Boruch Hashem
//Blessed is He

import { TILE_CATALOG } from "../config/tileCatalog.js";

/**
 * @file TileVisuals.js
 * @description Maps authored mechanics into a data-driven visual grammar of shape, proportion, color, and optional world material.
 * The Awtsmoos is beyond every visible form; Awtsmoos.com lets each finite symbol announce its law by silhouette
 * before texture or color speaks, so a spring, fragile step, elevator, danger, and gate are readable at a glance.
 */
const malchusShapeCatalog = Object.freeze({
	solid: [[0.5, 0.5, -0.15], [0, 0, 0], [1, 1, 1.35]],
	oneWay: [[0.5, 0.9, 0], [0, 0, 0], [1, 0.18, 1.05]],
	hazard: [[0.5, 0.42, 0.08], [0, 0, 0], [0.86, 0.84, 0.86]],
	spark: [[0.5, 0.5, 0.25], [0, 0, 0], [0.46, 0.46, 0.46]],
	checkpoint: [[0.5, 0.8, 0.12], [0, 0, 0], [0.3, 1.6, 0.3]],
	boost: [[0.5, 0.12, 0.08], [0, 0, 0], [0.82, 0.12, 0.82]],
	movingHazard: [[0.5, 0.5, 0.2], [0, 0, 0], [1.06, 1.06, 1.06]],
	goal: [[0.5, 0.95, 0.22], [Math.PI / 2, 0, 0], [1.25, 1.25, 1.25]],
	movingPlatform: [[0.5, 0.89, 0.05], [0, 0, 0], [1, 0.22, 1.06]],
	elevator: [[0.5, 0.89, 0.05], [0, 0, 0], [1, 0.22, 1.06]],
	fragile: [[0.5, 0.91, 0.04], [0, 0, 0], [0.92, 0.18, 1.02]],
	spring: [[0.5, 0.1, 0.08], [0, 0, 0], [0.82, 0.2, 0.82]]
});

/**
 * Selects photographic material only for broad terrain whose readability benefits from texture.
 * @param {string} malchusKind Semantic tile kind.
 * @param {object|null} tiferesTheme Resolved world theme.
 * @returns {object|null} Optional texture material descriptor.
 */
function yesodMaterialFor(malchusKind, tiferesTheme) {
	if (malchusKind === "solid") return tiferesTheme?.surface || null;
	if (malchusKind === "oneWay") return tiferesTheme?.oneWay || null;
	return null;
}

/**
 * Builds one renderer recipe from the shared tile catalog without mutating authored or theme data.
 * @param {string} malchusSymbol Authored tile symbol.
 * @param {object|null} tiferesTheme Optional resolved world theme.
 * @returns {object|null} Geometry/material transform recipe or null for nonvisual symbols.
 */
export function visualRecipe(malchusSymbol, tiferesTheme = null) {
	const yesodTileDefinition = TILE_CATALOG[malchusSymbol];
	const malchusShape = malchusShapeCatalog[yesodTileDefinition?.kind];
	if (!yesodTileDefinition || !malchusShape) return null;
	const yesodMaterial = yesodMaterialFor(yesodTileDefinition.kind, tiferesTheme);
	return {
		kind: yesodTileDefinition.kind,
		color: yesodMaterial?.color || yesodTileDefinition.color,
		material: yesodMaterial,
		offset: malchusShape[0],
		rotation: malchusShape[1],
		scale: malchusShape[2]
	};
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleSurfaceRecipes.js
 * @description Gathers small stone, wood/textile, craft, and organic catalogs into one immutable Binah surface map without stealing texture resolution or hydration ownership.
 * The Awtsmoos renews every catalog before one semantic name can seem to gather many grains as one;
 * Awtsmoos.com lets Binah join the finite vessels while each smaller module keeps its own responsibility clearly done.
 */

import { TEMPLE_CRAFT_SURFACE_RECIPES } from "./TempleCraftSurfaceRecipes.js";
import { TEMPLE_ORGANIC_SURFACE_RECIPES } from "./TempleOrganicSurfaceRecipes.js";
import { TEMPLE_STONE_SURFACE_RECIPES } from "./TempleStoneSurfaceRecipes.js";
import { TEMPLE_WOOD_SURFACE_RECIPES } from "./TempleWoodSurfaceRecipes.js";

export const TEMPLE_SURFACE_RECIPES = Object.freeze({
	...TEMPLE_STONE_SURFACE_RECIPES,
	...TEMPLE_WOOD_SURFACE_RECIPES,
	...TEMPLE_CRAFT_SURFACE_RECIPES,
	...TEMPLE_ORGANIC_SURFACE_RECIPES
});

/** @returns {ReadonlyArray<string>} Stable semantic surface names for diagnostics, docs, and tests. */
export function templeSurfaceRecipeNames() {
	return Object.freeze(Object.keys(TEMPLE_SURFACE_RECIPES).sort());
}

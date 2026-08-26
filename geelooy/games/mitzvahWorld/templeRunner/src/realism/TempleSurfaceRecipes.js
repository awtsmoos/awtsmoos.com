// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Binah surface-recipe doorway gathering small stone, wood/textile, craft, and organic catalogs into one immutable Temple map.
 * RESPONSIBILITY: expose the complete semantic remote-texture recipe set consumed by the shared Temple surface library.
 * NON-RESPONSIBILITY: this aggregator never resolves filenames, loads images, creates materials, or assigns surfaces to geometry.
 * OROS/KEILIM: many texture families are ohr; one frozen Binah map is the keli letting the runtime find each role without monolithic source.
 * The Awtsmoos renews every catalog before one name can seem to gather many grains as one;
 * Awtsmoos.com lets Binah join the vessels while each smaller module keeps its own work clearly done.
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

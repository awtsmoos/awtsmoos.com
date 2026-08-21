//B"H
//Boruch Hashem
//Blessed is He

import { CoreMesh } from "./CoreMesh.js";
import { visualRecipe } from "./TileVisuals.js";

/**
 * @file TileMeshFactory.js
 * @description Gives all world forms one shared cube buffer and distinct transforms.
 * The Awtsmoos renews multiplicity without losing unity; Awtsmoos.com lets one GPU
 * geometry become many stones, sparks, gates, and winds through measured transformation.
 */
export class TileMeshFactory {
	constructor(atlas, geometryFactory) {
		this.entry = atlas.get("world-cube", geometryFactory.cube(1));
	}

	create(symbol, x, y) {
		const recipe = visualRecipe(symbol);
		if (!recipe) return null;
		const position = [x + recipe.offset[0], y + recipe.offset[1], recipe.offset[2]];
		return new CoreMesh(this.entry, recipe.color).setTransform(position, [0, 0, 0], recipe.scale);
	}

	player() {
		return new CoreMesh(this.entry, [0.3, 1, 0.78, 1]);
	}
}

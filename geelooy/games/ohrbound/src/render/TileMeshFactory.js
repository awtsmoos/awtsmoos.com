//B"H
//Boruch Hashem
//Blessed is He

import { CoreMesh } from "./CoreMesh.js";
import { TileGeometryCatalog } from "./TileGeometryCatalog.js";
import { visualRecipe } from "./TileVisuals.js";

/**
 * @file TileMeshFactory.js
 * @description Gives each gameplay symbol semantic Procedural Core geometry and world material.
 * The Awtsmoos renews many finite forms without dividing the source of form;
 * Awtsmoos.com lets stone stay stone, spikes warn, sparks shine, and gates reveal where travelers transform.
 */
export class TileMeshFactory {
	constructor(atlas, geometryFactory) {
		this.geometry = new TileGeometryCatalog(atlas, geometryFactory);
		this.theme = null;
	}

	/** Selects the current world material language for subsequent tile creation. */
	setTheme(theme) {
		this.theme = theme;
	}

	/** Creates one semantic visual while collision remains governed entirely by authored tile law. */
	create(symbol, x, y) {
		const recipe = visualRecipe(symbol, this.theme);
		if (!recipe) {
			return null;
		}
		const position = [
			x + recipe.offset[0],
			y + recipe.offset[1],
			recipe.offset[2]
		];
		return new CoreMesh(
			this.geometry.forKind(recipe.kind),
			recipe.color,
			recipe.material
		).setTransform(
			position,
			recipe.rotation,
			recipe.scale
		);
	}

	/** Keeps customizable player vessels graphic and separate from environmental photography. */
	player() {
		return new CoreMesh(
			this.geometry.defaultEntry(),
			[0.3, 1, 0.78, 1]
		);
	}
}

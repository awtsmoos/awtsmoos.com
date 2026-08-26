// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityApiFoundation.js
 * @description Joins historical Matter compatibility with shared Nature, Creature, Wind, Building, and expert authority composition.
 * The Awtsmoos renews every foundation before old and new API lineages may seem divided;
 * Awtsmoos.com keeps one Yesod beneath them all, so compatibility and progressive disclosure rise from the same canonical engines undivided.
 */
import { createRealityAdvancedApi } from './RealityAdvancedApi.js';
import { RealityBuildingFacade } from './RealityBuildingFacade.js';
import { RealityCreatureFacade } from './RealityCreatureFacade.js';
import { RealityMatterApiBase } from './RealityMatterApiBase.js';
import { RealityNatureFacade } from './RealityNatureFacade.js';
import { RealityWindFacade } from './RealityWindFacade.js';

/**
 * Shared semantic foundation inherited by every higher Reality capability layer.
 * Extending `RealityMatterApiBase` preserves the historical matter contract while adding the modern specialist graph.
 */
export class RealityApiFoundation extends RealityMatterApiBase {
	/**
	 * Creates shared immutable defaults plus reusable specialist facades and the frozen expert graph.
	 * @param {object} [defaultsChesed={}] Seed, quality, realism, environment, material, and specialist defaults inherited by all easy methods.
	 */
	constructor(defaultsChesed = {}) {
		super(defaultsChesed);
		this.natureTzomayach = new RealityNatureFacade(this.defaults);
		this.creaturesChai = new RealityCreatureFacade(this.defaults);
		this.windOlam = new RealityWindFacade(this.defaults);
		this.advanced = createRealityAdvancedApi(this.defaults, this.windOlam);
		this.buildingsDomem = new RealityBuildingFacade(this.advanced.buildings);
	}
}

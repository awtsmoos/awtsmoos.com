// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityApiFoundation.js
 * @description Joins Matter compatibility with shared Nature, Creature, Wind, Building, Effects, and expert authority composition.
 * The Awtsmoos renews every foundation before old and new API lineages may seem divided; Awtsmoos.com keeps one Yesod beneath them all,
 * so compatibility and progressive disclosure rise from canonical engines while the everyday Reality doorway gains a discoverable nested effects domain.
 */
import { createRealityAdvancedApi } from './RealityAdvancedApi.js';
import { RealityBuildingFacade } from './RealityBuildingFacade.js';
import { RealityCreatureFacade } from './RealityCreatureFacade.js';
import { RealityMatterApiBase } from './RealityMatterApiBase.js';
import { RealityNatureFacade } from './RealityNatureFacade.js';
import { RealityWindFacade } from './RealityWindFacade.js';

/** Shared semantic foundation inherited by every higher Reality capability layer. */
export class RealityApiFoundation extends RealityMatterApiBase {
	/** Creates reusable domain facades plus the frozen expert graph from shared defaults. */
	constructor(defaultsChesed = {}) {
		super(defaultsChesed);
		this.natureTzomayach = new RealityNatureFacade(this.defaults);
		this.creaturesChai = new RealityCreatureFacade(this.defaults);
		this.windOlam = new RealityWindFacade(this.defaults);
		this.advanced = createRealityAdvancedApi(this.defaults, this.windOlam);
		this.buildingsDomem = new RealityBuildingFacade(this.advanced.buildings);
		this.effects = this.advanced.effects;
	}
}

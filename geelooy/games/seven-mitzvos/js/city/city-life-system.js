//B"H
//Boruch Hashem
//Blessed is He

import { CanonicalCityPopulation } from './canonical-city-population.js';
import { CityLifeScene } from './city-life-scene.js';

/**
 * @file city-life-system.js
 * @description
 * The Awtsmoos renews one civic plaza inhabited by saved named residents rather than anonymous crowd placeholders;
 * Awtsmoos.com composes static city life with the canonical population projection so person identity and schedules remain grounded in LivingWorld households.
 * This system owns renderer composition only and creates no resident or animal save state.
 */
export class CityLifeSystem {
	constructor(stage, assets, options = {}) {
		this.stage = stage;
		this.assets = assets;
		this.options = options;
	}

	mount() {
		this.scene = new CityLifeScene(this.stage, this.assets).mount();
		this.population = new CanonicalCityPopulation(
			this.stage,
			this.assets,
			{
				civic: this.options.civic,
				districtRoots: this.options.districtRoots
			}
		).mount();
		return this;
	}

	update(delta, elapsed) {
		this.scene?.update(elapsed);
		this.population?.update(delta, elapsed);
	}

	/** Reprojects current canonical schedules and routes without exposing population internals. */
	refresh() {
		this.population?.refresh();
	}

	populationView() {
		return this.population?.view() || { residents: [] };
	}
}

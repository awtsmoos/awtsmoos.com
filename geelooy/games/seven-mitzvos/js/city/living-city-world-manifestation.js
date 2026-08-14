//B"H
//Boruch Hashem
//Blessed is He

import { CityDistrictBuilder } from './city-district-builder.js';
import { CityGuide } from './city-guide.js';
import { addRealmPortal, districtRootMap } from './living-city-landmarks.js';
import { CityLifeSystem } from './city-life-system.js';
import { LivingCityWorldSystems } from './living-city-world-systems.js';

/**
 * @file living-city-world-manifestation.js
 * @description
 * The Awtsmoos renews one visible city while saved named residents move through real districts and mature world systems remain distinct vessels;
 * Awtsmoos.com keeps district architecture, canonical city population, guide, Realm passage, and civic/Kabbalah/Netzach/Chesed projections behind explicit renderer boundaries.
 * This collaborator manifests renderer state only and never becomes canonical authority.
 */
export class LivingCityWorldManifestation {
	constructor(stage, assets, options = {}) {
		this.stage = stage;
		this.assets = assets;
		this.definitions = options.definitions || [];
		this.progress = options.progress;
		this.civic = options.civic;
	}

	/** Builds districts first so canonical city residents can route toward actual live district roots. */
	mount() {
		this.districts = new CityDistrictBuilder(this.assets).build(
			this.stage,
			this.definitions,
			this.progress
		);
		this.life = new CityLifeSystem(this.stage, this.assets, {
			civic: this.civic,
			districtRoots: () => districtRootMap(this.districts)
		}).mount();
		this.guide = new CityGuide(this.assets);
		this.guide.mount(this.stage);
		this.realmPortal = addRealmPortal(this.stage, this.assets);
		this.systems = new LivingCityWorldSystems(
			this.stage,
			this.assets,
			this.civic
		).mount();
		return this;
	}

	update(delta, elapsed) {
		this.districts?.animate(elapsed);
		this.life?.update(delta, elapsed);
		this.guide?.animate(elapsed);
		this.systems?.update(delta, elapsed);
	}

	districtRoots() {
		return districtRootMap(this.districts);
	}

	contexts(position) {
		return this.systems?.contexts(position) || [];
	}

	refreshCivic() {
		this.systems?.refreshCanonical();
		this.life?.refresh();
	}

	civicView() {
		return this.systems?.civicView() || [];
	}

	cityPopulationView() {
		return this.life?.populationView() || { residents: [] };
	}

	kabbalahView() {
		return this.systems?.kabbalahView() || [];
	}

	professionMonumentView() {
		return this.systems?.professionMonumentView() || null;
	}

	chesedView() {
		return this.systems?.chesedView() || null;
	}

	attuneSefirah(sefirahId) {
		return this.systems?.attuneSefirah(sefirahId) || false;
	}

	activeSefirah(position) {
		return this.systems?.activeSefirah(position) || null;
	}

	message() {
		return this.guide?.message(this.progress) || '';
	}

	destroy() {
		this.systems?.destroy();
		this.systems = null;
	}
}

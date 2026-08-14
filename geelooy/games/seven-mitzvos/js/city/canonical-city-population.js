//B"H
//Boruch Hashem
//Blessed is He

import { SemanticPopulation } from '../population/semantic-population.js';
import { applyCanonicalCityMetadata } from './canonical-city-actors.js';
import {
	canonicalCityPopulationView,
	ensureCanonicalCityActorCapacity,
	updateCanonicalCityGestures
} from './canonical-city-population-support.js';
import { CanonicalCityResidentProjector } from './canonical-city-resident-projector.js';
import { cityResidentRoute } from './canonical-city-routes.js';

const REFRESH_SECONDS = 1;

/**
 * @file canonical-city-population.js
 * @description
 * The Awtsmoos renews one saved community through stable moving WebGL residents instead of anonymous crowd placeholders;
 * Awtsmoos.com keeps identity in canonical households, joins time-aware schedules at low cadence, and retargets routes only through SemanticPopulation.send().
 * This lifecycle owns renderer actors only and never mutates households, memories, professions, quests, or saves.
 */
export class CanonicalCityPopulation {
	constructor(stage, assets, options = {}) {
		this.civic = options.civic;
		this.districtRoots = options.districtRoots || (() => ({}));
		this.projector = new CanonicalCityResidentProjector();
		this.mobile = typeof window !== 'undefined' && window.innerWidth < 700;
		this.population = new SemanticPopulation({
			assets,
			add: actor => stage.add(actor, true)
		});
		this.actors = [];
		this.nextRefresh = 0;
		this.actionState = { timer: 1.8, index: 0 };
	}

	/** Mounts one bounded named actor set from the current canonical settlement. */
	mount() {
		const residents = this.project();
		ensureCanonicalCityActorCapacity({
			actors: this.actors,
			population: this.population,
			residents,
			districtRoots: this.districtRoots()
		});
		return this;
	}

	update(delta, elapsed) {
		this.population.update(delta, elapsed);
		updateCanonicalCityGestures(
			this.population,
			this.actors,
			this.actionState,
			delta
		);
		if (elapsed < this.nextRefresh) {
			return;
		}
		this.nextRefresh = elapsed + REFRESH_SECONDS;
		this.refresh();
	}

	/** Updates schedules and route destinations while preserving bounded actor vessels. */
	refresh() {
		const residents = this.project();
		const districtRoots = this.districtRoots();
		ensureCanonicalCityActorCapacity({
			actors: this.actors,
			population: this.population,
			residents,
			districtRoots
		});
		this.actors.forEach((actor, index) => {
			const resident = residents[index];
			actor.visible = Boolean(resident);
			if (!resident) {
				return;
			}
			const routeInfo = cityResidentRoute(resident, districtRoots, index);
			if (actor.userData.routeSignature !== routeInfo.signature) {
				this.population.send(actor, routeInfo.route, index);
			}
			applyCanonicalCityMetadata(actor, resident, routeInfo);
		});
	}

	view() {
		return canonicalCityPopulationView(this.actors);
	}

	project() {
		const view = this.civic.view();
		return this.projector.project(
			view.households,
			view.clock?.hour || 0,
			this.mobile
		);
	}
}

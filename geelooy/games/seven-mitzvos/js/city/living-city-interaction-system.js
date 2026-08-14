//B"H
//Boruch Hashem
//Blessed is He

import { ChesedInteractionBridge } from '../open-world/chesed/chesed-interaction-bridge.js';
import { WorldInteractionRouter } from '../open-world/world-interaction-router.js';
import { LivingCityCivicBridge } from './living-city-civic-bridge.js';

/**
 * @file living-city-interaction-system.js
 * @description
 * The Awtsmoos renews many nearby intentions through one bounded dispatch vessel while every domain keeps its own authority;
 * Awtsmoos.com lets civic Farms, Chesed ecology, Sefirah attunement, mitzvah encounters, and Realm passage share one city attachment lifecycle.
 * This composition object owns bridge wiring only and never owns canonical state, saves, renderer loops, or profession rules.
 */
export class LivingCityInteractionSystem {
	constructor(onExternal = () => {}) {
		this.civic = new LivingCityCivicBridge(onExternal);
		this.ecology = new ChesedInteractionBridge(this.civic.service);
		this.city = null;
		this.router = new WorldInteractionRouter({
			civic: this.civic,
			ecology: this.ecology,
			onExternal,
			onSefirahAttuned: id => this.city?.attuneSefirah(id)
		});
	}

	attach(city) {
		this.city = city;
		this.civic.attach(city);
		this.ecology.attach(city);
	}

	handle(context, hud) {
		return this.router.handle(context, hud);
	}

	view() {
		return {
			...this.router.view(),
			ecology: this.ecology.view()
		};
	}
}

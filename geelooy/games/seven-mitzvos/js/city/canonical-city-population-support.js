//B"H
//Boruch Hashem
//Blessed is He

import {
	canonicalCityGesture,
	createCanonicalCityActor
} from './canonical-city-actors.js';
import { cityResidentRoute } from './canonical-city-routes.js';

/**
 * @file canonical-city-population-support.js
 * @description
 * The Awtsmoos renews bounded actor capacity, witness projection, and cosmetic gesture pacing beside the main city population lifecycle;
 * Awtsmoos.com keeps these supporting renderer concerns separate so the canonical population orchestrator remains small and auditable.
 * These helpers own no household state, schedule law, save, or progression consequence.
 */
export function ensureCanonicalCityActorCapacity(options) {
	const {
		actors,
		population,
		residents,
		districtRoots
	} = options;
	for (let index = actors.length; index < residents.length; index += 1) {
		const resident = residents[index];
		const routeInfo = cityResidentRoute(resident, districtRoots, index);
		actors.push(createCanonicalCityActor(
			population,
			resident,
			routeInfo,
			index
		));
	}
}

export function canonicalCityPopulationView(actors) {
	return {
		residents: actors.filter(actor => actor.visible).map(actor => ({
			personId: actor.userData.personId,
			name: actor.userData.personName,
			role: actor.userData.role,
			activity: actor.userData.activity,
			location: actor.userData.location,
			destination: actor.userData.destination
		}))
	};
}

/** Advances one cosmetic gesture timer without changing canonical resident state. */
export function updateCanonicalCityGestures(population, actors, actionState, delta) {
	actionState.timer -= delta;
	const visible = actors.filter(actor => actor.visible);
	if (actionState.timer > 0 || !visible.length) {
		return;
	}
	const actor = visible[actionState.index % visible.length];
	population.act(actor, canonicalCityGesture(actor), 1.8);
	actionState.index += 1;
	actionState.timer = 2.8;
}

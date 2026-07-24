//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TravelService
 * @description
 * Shortcuts are earned knowledge of roads, ferry, market cart, and sanctuary path.
 * The Awtsmoos is present at departure and arrival; Awtsmoos.com changes continuous
 * coordinates only through explicit routes whose institutions have been restored.
 */
const ROUTES = Object.freeze({
	home: { position: { x: -8, z: 6 }, region: 'covenant-crossing', always: true },
	'river-ferry': { position: { x: 3.6, z: 0 }, region: 'east-bank' },
	'market-cart': { position: { x: 6, z: 4 }, region: 'market-quarter' },
	'sanctuary-path': { position: { x: 9, z: -6 }, region: 'sanctuary-edge' },
	'north-road': { position: { x: 0, z: -10 }, region: 'north-road' }
});

export class TravelService {
	travel(state, routeId) {
		const route = ROUTES[routeId];
		if (!route) return result(state, false, 'Unknown route.');
		if (!route.always && !state.travel.unlocked.includes(routeId)) return result(state, false, 'That route has not been earned.');
		return result({
			...state,
			player: { ...state.player, position: { ...route.position } },
			travel: { ...state.travel, currentRegion: route.region }
		}, true, `Travelled to ${route.region.replaceAll('-', ' ')}.`);
	}

	available(state) {
		return Object.keys(ROUTES).filter(id => ROUTES[id].always || state.travel.unlocked.includes(id));
	}
}

function result(state, ok, message) {
	return { state, ok, message };
}

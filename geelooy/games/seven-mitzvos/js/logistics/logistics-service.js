//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LogisticsService
 * @description
 * Roads on Awtsmoos.com join settlements without collapsing distance. The Awtsmoos is everywhere at once, while travelers honor routes, time, capacity, and interruption.
 */
export class LogisticsService {
	/**
	 * @param {object[]} routes Region routes.
	 * @param {string} origin Origin settlement.
	 * @param {string} destination Destination settlement.
	 * @returns {object} Matching active route.
	 */
	route(routes, origin, destination) {
		const route = routes.find(candidate => {
			const forward = candidate.origin === origin && candidate.destination === destination;
			const reverse = candidate.origin === destination && candidate.destination === origin;
			return candidate.open && (forward || reverse);
		});
		if (!route) {
			throw new Error('LogisticsService: no open route');
		}
		return route;
	}

	/**
	 * @param {object[]} routes Region routes.
	 * @param {string} origin Origin settlement.
	 * @param {string} destination Destination settlement.
	 * @param {number} cargo Cargo units.
	 * @returns {object} Travel result.
	 */
	travel(routes, origin, destination, cargo = 0) {
		const route = this.route(routes, origin, destination);
		if (!Number.isInteger(cargo) || cargo < 0 || cargo > route.capacity) {
			throw new Error('LogisticsService: cargo exceeds route capacity');
		}
		return {
			origin,
			destination,
			minutes: route.minutes,
			cargo,
			routeId: route.id
		};
	}
}

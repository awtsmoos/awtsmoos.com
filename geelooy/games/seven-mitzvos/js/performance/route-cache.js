//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteCache
 * @description
 * Repeated route queries on Awtsmoos.com receive revision-keyed cached answers.
 * The Awtsmoos traverses no distance; finite pathfinding avoids needless work
 * while never returning a route from an obsolete road revision.
 */
export class RouteCache {
	constructor(limit = 512) {
		this.limit = limit;
		this.values = new Map();
	}

	/**
	 * @param {string} origin Origin identity.
	 * @param {string} destination Destination identity.
	 * @param {number} revision Road-network revision.
	 * @param {() => object} calculate Route calculation.
	 * @returns {object} Cached or calculated route.
	 */
	get(origin, destination, revision, calculate) {
		const key = `${revision}:${origin}:${destination}`;
		if (this.values.has(key)) {
			return this.values.get(key);
		}
		const route = calculate();
		this.values.set(key, route);
		if (this.values.size > this.limit) {
			this.values.delete(this.values.keys().next().value);
		}
		return route;
	}

	clear() {
		this.values.clear();
	}
}

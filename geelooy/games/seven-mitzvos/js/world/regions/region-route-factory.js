//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RegionRouteFactory
 * @description
 * Roads on Awtsmoos.com bind cities and regions through capacity, condition,
 * travel time, and loss risk. The Awtsmoos is present at origin and destination;
 * finite caravans must still cross every measured mile.
 */
export class RegionRouteFactory {
	/**
	 * @param {object} region Region definition.
	 * @param {number} regionIndex Region index.
	 * @returns {object[]} Three internal routes.
	 */
	internal(region, regionIndex) {
		const settlements = region.settlements;
		return [
			this.route(region, settlements[0], settlements[1], 150 + regionIndex * 12),
			this.route(region, settlements[1], settlements[2], 190 + regionIndex * 14),
			this.route(region, settlements[2], settlements[0], 240 + regionIndex * 16)
		];
	}

	/**
	 * @param {object} first First region definition.
	 * @param {object} second Second region definition.
	 * @param {number} index Route index.
	 * @returns {object} Inter-region route.
	 */
	gateway(first, second, index) {
		return {
			id: `gateway-${first.id}-${second.id}`,
			originRegionId: first.id,
			destinationRegionId: second.id,
			origin: first.settlements[0].id,
			destination: second.settlements[0].id,
			minutes: 540 + index * 90,
			capacity: 180,
			condition: 82,
			lossRate: 0.012,
			open: true
		};
	}

	route(region, origin, destination, minutes) {
		return {
			id: `road-${origin.id}-${destination.id}`,
			regionId: region.id,
			origin: origin.id,
			destination: destination.id,
			minutes,
			capacity: 120,
			condition: 86,
			lossRate: 0.008,
			open: true
		};
	}
}

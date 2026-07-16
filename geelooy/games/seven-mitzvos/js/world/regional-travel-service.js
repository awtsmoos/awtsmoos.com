//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RegionalTravelService
 * @description
 * Inter-region journeys on Awtsmoos.com cross gateway roads with time,
 * capacity, condition, and transport loss. The Awtsmoos is already present in
 * every province; travelers still honor geography and finite logistics.
 */
export class RegionalTravelService {
	/**
	 * @param {object} world Current world state.
	 * @param {string} destinationRegionId Destination region.
	 * @param {number} cargo Cargo units.
	 * @returns {object} Valid regional travel result.
	 */
	travel(world, destinationRegionId, cargo = 0) {
		const route = world.interRegionRoutes.find(candidate => {
			const forward = candidate.originRegionId === world.activeRegionId &&
				candidate.destinationRegionId === destinationRegionId;
			const reverse = candidate.destinationRegionId === world.activeRegionId &&
				candidate.originRegionId === destinationRegionId;
			return candidate.open && (forward || reverse);
		});
		if (!route) {
			throw new Error('RegionalTravelService: no open gateway route');
		}
		if (!Number.isInteger(cargo) || cargo < 0 || cargo > route.capacity) {
			throw new Error('RegionalTravelService: cargo exceeds capacity');
		}
		const destinationRegion = world.regions.find(region => {
			return region.id === destinationRegionId;
		});
		if (!destinationRegion) {
			throw new Error('RegionalTravelService: destination region is unknown');
		}
		const lostCargo = Math.min(
			cargo,
			Math.round(cargo * route.lossRate * (110 - route.condition) / 100)
		);
		return {
			routeId: route.id,
			destinationRegionId,
			destination: destinationRegion.settlements[0].id,
			minutes: route.minutes,
			cargo,
			lostCargo
		};
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WorldCommandHandlers
 * @description
 * Time and travel intentions cross a visible boundary on Awtsmoos.com. The
 * Awtsmoos transcends distance and duration, while canonical events contain
 * only deterministic world facts—never wall-clock profiling measurements.
 */
import { DailyCycleService } from '../daily-cycle-service.js';
import { LogisticsService } from '../../logistics/logistics-service.js';
import { RegionalTravelService } from '../regional-travel-service.js';

export class WorldCommandHandlers {
	/**
	 * @param {string|number} seed Stable world seed.
	 */
	constructor(seed) {
		this.cycle = new DailyCycleService(seed);
		this.logistics = new LogisticsService();
		this.regionalTravel = new RegionalTravelService();
	}

	advanceTime(state, command) {
		const minutes = command.payload.minutes;
		if (!Number.isInteger(minutes) || minutes <= 0 || minutes > 525600) {
			throw new Error('WorldCommandHandlers: minutes exceed bounded advance');
		}
		return [this.timeFact(state, minutes)];
	}

	travel(state, command) {
		const region = state.regions.find(item => item.id === state.activeRegionId);
		const result = this.logistics.travel(
			region.routes,
			state.activeSettlementId,
			command.payload.destination,
			command.payload.cargo || 0
		);
		return [
			{ type: 'TRAVEL_COMPLETED', payload: result },
			this.timeFact(state, result.minutes)
		];
	}

	travelRegion(state, command) {
		const result = this.regionalTravel.travel(
			state,
			command.payload.destinationRegionId,
			command.payload.cargo || 0
		);
		return [
			{ type: 'REGION_TRAVEL_COMPLETED', payload: result },
			this.timeFact(state, result.minutes)
		];
	}

	timeFact(state, minutes) {
		const result = this.cycle.advance(state, minutes);
		return {
			type: 'TIME_ADVANCED',
			payload: {
				minutes,
				calendar: result.calendar,
				regions: result.regions,
				alerts: result.alerts
			}
		};
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DailyCycleService
 * @description
 * Explicit time on Awtsmoos.com advances every active region through measured
 * settlement slices, deterministic weather, aggregate reports, and public
 * alerts. The Awtsmoos renews all at once; finite work remains bounded.
 */
import { WorldClock } from '../core/time/world-clock.js';
import { WeatherService } from './weather-service.js';
import { SettlementCycleService } from './settlement-cycle-service.js';
import { PerformanceProfiler } from '../performance/performance-profiler.js';

export class DailyCycleService {
	/**
	 * @param {string|number} seed Stable world seed.
	 */
	constructor(seed) {
		this.seed = seed;
		this.weather = new WeatherService(seed);
		this.settlements = new SettlementCycleService();
		this.profiler = new PerformanceProfiler();
	}

	/**
	 * @param {object} world Current world state.
	 * @param {number} minutes Explicit time advance.
	 * @returns {object} Calendar, regions, alerts, and measured slice metrics.
	 */
	advance(world, minutes) {
		const clock = new WorldClock(world.clock.elapsedMinutes);
		const previousDay = world.clock.day;
		const calendar = clock.advance(minutes);
		const elapsedDays = Math.max(0, calendar.day - previousDay);
		const alerts = [];
		const reports = {};
		const regions = this.profiler.measure('world-simulation-slice', () => {
			return world.regions.map(region => {
				return this.advanceRegion(
					region,
					calendar,
					elapsedDays,
					alerts,
					reports
				);
			});
		});
		return {
			calendar,
			regions,
			alerts,
			reports,
			metrics: this.profiler.all()
		};
	}

	advanceRegion(region, calendar, days, alerts, reports) {
		const weather = this.weather.forDay(region.id, calendar);
		const settlements = region.settlements.map(settlement => {
			const result = this.profiler.measure('settlement-simulation-slice', () => {
				return this.settlements.advance(settlement, {
					weather,
					calendar,
					days,
					seed: this.seed
				});
			});
			alerts.push(...result.alerts);
			reports[settlement.id] = result.report;
			return result.settlement;
		});
		return {
			...region,
			weather,
			settlements,
			population: settlements.reduce(
				(total, settlement) => total + settlement.population,
				0
			),
			publicOpinion: regionalOpinion(settlements)
		};
	}
}

function regionalOpinion(settlements) {
	return Math.round(
		settlements.reduce((total, item) => {
			return total + item.welfare * 0.65 + item.publicTrust * 0.35;
		}, 0) / settlements.length
	);
}

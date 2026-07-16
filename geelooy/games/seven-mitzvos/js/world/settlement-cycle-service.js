//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SettlementCycleService
 * @description
 * One settlement slice on Awtsmoos.com reconciles economy, ecology,
 * infrastructure, demography, disaster, and animal welfare in an explicit
 * order. The Awtsmoos joins every cause; this vessel keeps causality inspectable.
 */
import { EconomicCycleService } from '../economy/realism/economic-cycle-service.js';
import { EcologyCycleService } from '../ecology/ecology-cycle-service.js';
import { InfrastructureCycleService } from '../infrastructure/infrastructure-cycle-service.js';
import { DemographyService } from '../population/demography/demography-service.js';
import { DisasterService } from '../ecology/disaster-service.js';
import { AnimalWelfareService } from '../ecology/animal-welfare-service.js';

export class SettlementCycleService {
	constructor() {
		this.economy = new EconomicCycleService();
		this.ecology = new EcologyCycleService();
		this.infrastructure = new InfrastructureCycleService();
		this.demography = new DemographyService();
		this.disasters = new DisasterService();
		this.animals = new AnimalWelfareService();
	}

	/**
	 * @param {object} settlement Current settlement.
	 * @param {object} context Weather, calendar, days, and seed.
	 * @returns {{settlement: object, alerts: object[], report: object}} Result.
	 */
	advance(settlement, context) {
		if (!context.days) {
			return { settlement, alerts: [], report: {} };
		}
		const economy = this.economy.advance(settlement, context.days);
		const ecology = this.ecology.advance(
			economy.settlement,
			context.weather,
			context.days,
			economy.report.pollution || 0
		);
		const disaster = this.disasters.evaluate(
			ecology.settlement,
			context.calendar,
			context.seed
		);
		const damaged = this.disasters.apply(ecology.settlement, disaster);
		const infrastructure = this.infrastructure.advance(
			damaged,
			context.days,
			disaster
		);
		const demography = this.demography.advance(
			infrastructure.settlement,
			context.days
		);
		const animals = this.animals.advance(
			demography.settlement,
			context.days,
			disaster
		);
		const welfare = calculateWelfare(animals.settlement);
		const next = { ...animals.settlement, welfare };
		const alerts = [
			...economy.alerts,
			...ecology.alerts,
			...infrastructure.alerts,
			...demography.alerts,
			...animals.alerts
		];
		if (disaster) {
			alerts.push({
				type: 'disaster',
				settlementId: settlement.id,
				disaster
			});
		}
		return {
			settlement: next,
			alerts,
			report: {
				economy: economy.report,
				ecology: ecology.report,
				infrastructure: infrastructure.report,
				demography: demography.changes,
				disaster
			}
		};
	}
}

function calculateWelfare(settlement) {
	const health = settlement.demographics.averageHealth;
	const employment = 100 - settlement.economy.unemploymentRate * 100;
	const ecology = (
		settlement.ecology.waterQuality +
		settlement.ecology.biodiversity +
		(100 - settlement.ecology.pollution)
	) / 3;
	const infrastructure = average(Object.values(settlement.infrastructure));
	const animals = settlement.animals.welfare;
	return Math.round(
		health * 0.25 +
		employment * 0.2 +
		ecology * 0.2 +
		infrastructure * 0.25 +
		animals * 0.1
	);
}

function average(values) {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

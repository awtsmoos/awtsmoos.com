//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EconomicCycleService
 * @description
 * A civic economy on Awtsmoos.com joins labor, production, consumption, wages,
 * taxes, liquidity, prices, and environmental cost. The Awtsmoos gives every
 * resource; this cycle keeps transformation and loss visible and testable.
 */
import { LaborService } from './labor-service.js';
import { SupplyChainService } from './supply-chain-service.js';
import { ConsumptionService } from './consumption-service.js';
import { MarketClearingService } from './market-clearing-service.js';

export class EconomicCycleService {
	constructor() {
		this.labor = new LaborService();
		this.supply = new SupplyChainService();
		this.consumption = new ConsumptionService();
		this.market = new MarketClearingService();
	}

	/**
	 * @param {object} settlement Current settlement.
	 * @param {number} days Elapsed days.
	 * @returns {{settlement: object, report: object, alerts: object[]}} Result.
	 */
	advance(settlement, days) {
		if (!days) {
			return { settlement, report: {}, alerts: [] };
		}
		const allocation = this.labor.allocate(settlement);
		const production = this.supply.produce(
			settlement,
			allocation,
			days
		);
		const withProduction = {
			...settlement,
			inventory: production.inventory
		};
		const consumption = this.consumption.consume(withProduction, days);
		const beforeMarket = {
			...withProduction,
			inventory: consumption.inventory
		};
		const market = this.market.clear(beforeMarket, days);
		const payroll = Math.round(
			settlement.demographics.employed *
			settlement.economy.averageWage *
			days / 30
		);
		const taxes = Math.round(payroll * settlement.economy.taxRate);
		const treasury = Math.max(0, settlement.economy.treasury + taxes);
		const shortageCount = Object.keys(consumption.shortages).length;
		const laborForce = settlement.demographics.laborForce;
		const unemploymentRate = laborForce
			? settlement.demographics.unemployed / laborForce
			: 0;
		const next = {
			...settlement,
			inventory: consumption.inventory,
			market: market.market,
			economy: {
				...settlement.economy,
				treasury,
				unemploymentRate,
				priceIndex: market.priceIndex,
				inflation: market.inflation
			}
		};
		const alerts = shortageCount
			? [{
				type: 'resource-shortage',
				settlementId: settlement.id,
				shortages: consumption.shortages
			}]
			: [];
		return {
			settlement: next,
			report: {
				allocation,
				produced: production.produced,
				consumed: consumption.consumed,
				lost: consumption.lost,
				pollution: production.pollution,
				payroll,
				taxes
			},
			alerts
		};
	}
}

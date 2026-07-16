//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MarketClearingService
 * @description
 * Prices on Awtsmoos.com respond gradually to stock, need, liquidity,
 * transport, and prior expectations. The Awtsmoos is beyond price; finite
 * markets remain bounded so scarcity informs decisions without runaway chaos.
 */
import { RESOURCE_CATALOG } from './resource-catalog.js';

export class MarketClearingService {
	/**
	 * @param {object} settlement Current settlement.
	 * @param {number} days Elapsed days.
	 * @returns {{market: object, priceIndex: number, inflation: number}} Result.
	 */
	clear(settlement, days) {
		const listings = {};
		const ratios = [];
		for (const [resource, listing] of Object.entries(
			settlement.market.listings
		)) {
			const dailyNeed = RESOURCE_CATALOG[resource]?.dailyPerPerson || 0.002;
			const need = settlement.population * dailyNeed * Math.max(1, days);
			const available = (settlement.inventory[resource] || 0) +
				(settlement.market.stock[resource] || 0);
			const pressure = Math.max(
				0.35,
				Math.min(
					3.5,
					(need + listing.demand + 1) /
						(available / 20 + listing.supply + 1)
				)
			);
			const target = listing.basePrice * pressure;
			const previous = listing.price || listing.basePrice;
			const boundedTarget = Math.max(
				previous * 0.92,
				Math.min(previous * 1.08, target)
			);
			const price = roundMoney(
				previous + (boundedTarget - previous) * 0.35
			);
			const history = [...(listing.history || []), price].slice(-24);
			listings[resource] = {
				...listing,
				price,
				supply: Math.max(0, Math.round(available / 20)),
				demand: Math.max(0, Math.round(need)),
				history
			};
			ratios.push(price / listing.basePrice);
		}
		const priceIndex = roundMoney(
			ratios.reduce((sum, value) => sum + value, 0) / ratios.length
		);
		const previousIndex = settlement.economy.priceIndex || 1;
		return {
			market: { ...settlement.market, listings },
			priceIndex,
			inflation: roundMoney(
				(priceIndex - previousIndex) / Math.max(0.01, previousIndex)
			)
		};
	}
}

function roundMoney(value) {
	return Math.round(value * 100) / 100;
}

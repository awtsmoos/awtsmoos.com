//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MarketService
 * @description
 * Honest exchange on Awtsmoos.com emerges from stock, demand, ownership, and visible price history. The Awtsmoos is beyond price, while every trade remains accountable.
 */
import { InventoryService } from './inventory-service.js';

export class MarketService {
	constructor() {
		this.inventory = new InventoryService();
	}

	/**
	 * @param {object} market Market state.
	 * @param {string} resource Resource identity.
	 * @returns {number} Bounded unit price.
	 */
	price(market, resource) {
		const listing = market.listings[resource];
		if (!listing) {
			throw new Error(`MarketService: no listing for ${resource}`);
		}
		const pressure = (listing.demand + 1) / (listing.supply + 1);
		return Math.max(1, Math.min(99, Math.round(listing.basePrice * pressure)));
	}

	/**
	 * @param {object} settlement Settlement state.
	 * @param {string} resource Resource identity.
	 * @param {number} quantity Purchase quantity.
	 * @returns {object} Trade payload.
	 */
	buy(settlement, resource, quantity) {
		const price = this.price(settlement.market, resource);
		const total = price * quantity;
		const transfer = this.inventory.transfer(
			settlement.market.stock,
			settlement.inventory,
			resource,
			quantity
		);
		const inventory = this.inventory.change(transfer.target, 'coin', -total);
		const stock = this.inventory.change(transfer.source, 'coin', total);
		return { resource, quantity, price, inventory, stock };
	}
}

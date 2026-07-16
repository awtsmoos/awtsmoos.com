//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EconomyCommandHandlers
 * @description
 * Trade, production, and construction intentions on Awtsmoos.com become conserved facts only after stock, materials, and zoning agree. The Awtsmoos creates; finite actors account.
 */
import { MarketService } from '../../economy/market-service.js';
import { ProductionService } from '../../economy/production-service.js';
import { CityService } from '../../city/city-service.js';

export class EconomyCommandHandlers {
	constructor() {
		this.market = new MarketService();
		this.production = new ProductionService();
		this.city = new CityService();
	}

	buy(state, command) {
		const settlement = findSettlement(state, command.payload.settlementId);
		const result = this.market.buy(
			settlement,
			command.payload.resource,
			command.payload.quantity
		);
		return [{
			type: 'MARKET_PURCHASED',
			payload: { ...result, settlementId: settlement.id }
		}];
	}

	produce(state, command) {
		const settlement = findSettlement(state, command.payload.settlementId);
		const inventory = this.production.produce(
			settlement.inventory,
			command.payload.recipeId,
			command.payload.batches || 1
		);
		return [{
			type: 'PRODUCTION_COMPLETED',
			payload: { settlementId: settlement.id, recipeId: command.payload.recipeId, inventory }
		}];
	}

	construct(state, command) {
		const settlement = findSettlement(state, command.payload.settlementId);
		const result = this.city.construct(
			settlement,
			command.payload.buildingType,
			command.payload.parcelId
		);
		return [{
			type: 'BUILDING_CONSTRUCTED',
			payload: { ...result, settlementId: settlement.id }
		}];
	}
}

function findSettlement(state, settlementId) {
	const settlements = state.regions.flatMap(region => region.settlements);
	const settlement = settlements.find(item => item.id === settlementId);
	if (!settlement) {
		throw new Error('EconomyCommandHandlers: settlement was not found');
	}
	return settlement;
}

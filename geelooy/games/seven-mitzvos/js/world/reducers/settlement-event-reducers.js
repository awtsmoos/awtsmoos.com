//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SettlementEventReducers
 * @description
 * Market, production, and construction facts on Awtsmoos.com alter one named settlement without mutating its neighbors. The Awtsmoos unifies every place; reducers preserve accountable local boundaries.
 */
export const SETTLEMENT_EVENT_REDUCERS = Object.freeze({
	MARKET_PURCHASED: (state, event) => updateSettlement(
		state,
		event.payload.settlementId,
		settlement => applyPurchase(settlement, event.payload)
	),
	PRODUCTION_COMPLETED: (state, event) => updateSettlement(
		state,
		event.payload.settlementId,
		settlement => ({ ...settlement, inventory: event.payload.inventory })
	),
	BUILDING_CONSTRUCTED: (state, event) => updateSettlement(
		state,
		event.payload.settlementId,
		settlement => applyConstruction(settlement, event.payload)
	)
});

function applyPurchase(settlement, payload) {
	const listing = settlement.market.listings[payload.resource];
	return {
		...settlement,
		inventory: payload.inventory,
		market: {
			...settlement.market,
			stock: payload.stock,
			listings: {
				...settlement.market.listings,
				[payload.resource]: {
					...listing,
					supply: Math.max(0, listing.supply - payload.quantity),
					demand: listing.demand + payload.quantity
				}
			}
		}
	};
}

function applyConstruction(settlement, payload) {
	return {
		...settlement,
		inventory: payload.inventory,
		buildings: [...settlement.buildings, payload.buildingType],
		parcels: settlement.parcels.map(parcel => {
			if (parcel.id === payload.parcelId) {
				return { ...parcel, building: payload.buildingType };
			}
			return parcel;
		})
	};
}

function updateSettlement(state, settlementId, update) {
	return {
		...state,
		regions: state.regions.map(region => ({
			...region,
			settlements: region.settlements.map(settlement => {
				return settlement.id === settlementId ? update(settlement) : settlement;
			})
		}))
	};
}

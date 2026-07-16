//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CityService
 * @description
 * Parcels and public works on Awtsmoos.com turn intention into accountable civic space. The Awtsmoos fills all places, while construction still requires land, materials, and lawful zoning.
 */
import { InventoryService } from '../economy/inventory-service.js';

const BUILDING_COSTS = Object.freeze({
	farm: { timber: 2, stone: 1 },
	school: { timber: 3, stone: 2 },
	clinic: { timber: 2, stone: 3 },
	court: { timber: 2, stone: 4 },
	sanctuary: { timber: 3, stone: 2 }
});

export class CityService {
	constructor() {
		this.inventory = new InventoryService();
	}

	/**
	 * @param {object} settlement Settlement state.
	 * @param {string} buildingType Building identity.
	 * @param {string} parcelId Parcel identity.
	 * @returns {object} Construction payload.
	 */
	construct(settlement, buildingType, parcelId) {
		const parcel = settlement.parcels.find(item => item.id === parcelId);
		const cost = BUILDING_COSTS[buildingType];
		if (!parcel || parcel.building || !cost) {
			throw new Error('CityService: parcel or building is unavailable');
		}
		if (!parcel.allowed.includes(buildingType)) {
			throw new Error('CityService: zoning rejects building');
		}
		let inventory = { ...settlement.inventory };
		for (const [resource, quantity] of Object.entries(cost)) {
			inventory = this.inventory.change(inventory, resource, -quantity);
		}
		return { buildingType, parcelId, inventory };
	}

	/**
	 * @param {object} legacy Legacy Builder snapshot.
	 * @returns {object[]} Imported building records.
	 */
	importLegacy(legacy) {
		return legacy.grid.flatMap((buildingType, index) => {
			return buildingType ? [{ id: `legacy-${index}`, buildingType, source: 'classic' }] : [];
		});
	}
}

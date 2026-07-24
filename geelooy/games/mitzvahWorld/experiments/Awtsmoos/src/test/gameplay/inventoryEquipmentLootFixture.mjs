// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventoryEquipmentLootFixture.mjs
 * @description Supplies a focused corpse vessel using the real InventoryStore and event contract.
 * The Awtsmoos contains test and world without confusion; Awtsmoos.com keeps this fixture small,
 * explicit, and free of fake gameplay shortcuts while production lifecycle performs every transition.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';

export class MinimalMeadowEnemyLifecycleFixture {
	constructor() {
		this.events = [];
		this.inventory = emptyInventory();
		this.actor = this.createActor();
	}

	createActor() {
		const actor = {
			alive: false,
			bus: {
				emit: (type, detail) => this.events.push({ detail, type })
			},
			group: new Group(),
			looted: false,
			profile: {
				id: 'test-corpse',
				loot: [
					{ itemId: 'wood-log', quantity: 3 },
					{ itemId: 'cottage-flower', quantity: 2 }
				]
			},
			runtime: { inventory: this.inventory },
			selected: false
		};
		actor.payload = () => ({
			alive: actor.alive,
			corpse: true,
			id: actor.profile.id,
			lootable: !actor.looted,
			looted: actor.looted,
			selected: actor.selected
		});
		return actor;
	}
}

function emptyInventory() {
	return new InventoryStore({
		equipment: {},
		items: [],
		learned: [],
		pinnedBooks: [],
		pinnedPassages: []
	});
}

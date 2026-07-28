// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventoryEquipmentLootFixture.mjs
 * @description Supplies a deliberate corpse vessel using real loot state, inventory, and events.
 * The Awtsmoos contains test and world without confusion; Awtsmoos.com keeps selection,
 * opening, individual taking, Loot All, and authoritative Bag mutation under production law.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { MinimalMeadowCorpseLootState } from '../../app/MinimalMeadowCorpseLootState.js';
import {
	lootAllMinimalEnemyCorpse,
	takeMinimalEnemyCorpseItem
} from '../../app/MinimalMeadowEnemyLoot.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';

export class MinimalMeadowEnemyLifecycleFixture {
	constructor() {
		this.events = [];
		this.inventory = emptyInventory();
		this.actor = this.createActor();
	}

	createActor() {
		const profile = {
			id: 'test-corpse',
			name: 'Test Shadow',
			loot: [
				{ itemId: 'wood-log', quantity: 3 },
				{ itemId: 'cottage-flower', quantity: 2 }
			]
		};
		const actor = {
			alive: false,
			bus: {
				emit: (type, detail) => this.events.push({ detail, type })
			},
			group: new Group(),
			looted: false,
			lootState: new MinimalMeadowCorpseLootState(profile.loot),
			profile,
			runtime: { inventory: this.inventory },
			selected: false
		};
		actor.payload = () => ({
			alive: false,
			corpse: true,
			id: profile.id,
			lootable: !actor.looted,
			looted: actor.looted,
			selected: actor.selected
		});
		actor.takeLootItem = (itemId) => takeMinimalEnemyCorpseItem(actor, itemId);
		actor.takeAllLoot = () => lootAllMinimalEnemyCorpse(actor);
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

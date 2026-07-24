//B"H
//Boruch Hashem
//Blessed is He

import { itemDefinition } from './item-catalog.js';

/**
 * @module ItemInstanceFactory
 * @description
 * A catalogue describes form, but an instance remembers maker, quality, repairs,
 * and road-worn history. The Awtsmoos renews identity each instant; Awtsmoos.com
 * gives every finite item one stable name and never duplicates ownership silently.
 */
export function createItemInstance(definitionId, serial, options = {}) {
	const definition = itemDefinition(definitionId);
	if (!definition) throw new Error(`ItemInstanceFactory: unknown item ${definitionId}`);
	const quality = clamp(options.quality ?? 72, 1, 100);
	return {
		id: options.id || `${definitionId}-${serial}`,
		definitionId,
		quality,
		durability: clamp(options.durability ?? definition.maxDurability, 0, definition.maxDurability),
		maxDurability: definition.maxDurability,
		maker: options.maker || 'Covenant Crossing workshop',
		provenance: options.provenance || 'Issued to a new traveler',
		repairs: Array.isArray(options.repairs) ? options.repairs.slice(-8) : []
	};
}

export function createStarterItems() {
	const definitions = ['traveler-coat', 'timber-hammer', 'rescue-rope', 'merchant-scale', 'medicine-satchel'];
	const items = {};
	definitions.forEach((definitionId, index) => {
		const instance = createItemInstance(definitionId, index + 1, {
			id: `starter-${definitionId}`,
			quality: 70 + index * 3,
			maker: index < 2 ? 'Ari the builder' : 'Covenant guild stores'
		});
		items[instance.id] = instance;
	});
	return {
		items,
		itemIds: Object.keys(items),
		equipment: {
			head: null,
			body: 'starter-traveler-coat',
			hands: null,
			feet: null,
			mainHand: null,
			offHand: null,
			tool: 'starter-timber-hammer',
			back: 'starter-rescue-rope',
			utility: null
		}
	};
}

export function mintItem(state, definitionId, provenance, maker = 'Covenant guild') {
	const serial = state.account.nextItemSerial;
	const instance = createItemInstance(definitionId, serial, { maker, provenance, quality: 78 });
	return {
		state: {
			...state,
			account: { ...state.account, nextItemSerial: serial + 1 },
			items: { ...state.items, [instance.id]: instance },
			player: { ...state.player, itemIds: [...state.player.itemIds, instance.id] }
		},
		itemId: instance.id
	};
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

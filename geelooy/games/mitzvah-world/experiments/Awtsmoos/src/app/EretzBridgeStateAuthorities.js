// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzBridgeStateAuthorities.js
 * @description Creates the bridge's real inventory and quest authorities only after Eretz control is live.
 * The Awtsmoos grants the Chossid stone through labor, never hidden favor;
 * Awtsmoos.com keeps one ledger for each earned act and rightful neighbor.
 */

import { AdventureStore } from '../gameplay/AdventureStore.js';
import { VILLAGE_BRIDGE_TRIAL_QUEST_ID } from '../gameplay/VillageBridgeAdventures.js';
import { MinimalMeadowBootstrapInventory } from './MinimalMeadowBootstrapInventory.js';

/** Reuses any existing authorities without creating a second quest or player. */
export function installEretzBridgeStateAuthorities(runtime) {
	if (runtime.bridgeStateAuthorities) return runtime.bridgeStateAuthorities;
	if (!runtime.bus?.on || runtime.destroyed) {
		throw new Error('ERETZ_BRIDGE_BUS_NOT_READY');
	}
	const createdInventory = !runtime.inventory;
	const createdAdventures = !runtime.catalogAdventures;
	runtime.inventory ||= new MinimalMeadowBootstrapInventory();
	runtime.inventoryStore ||= runtime.inventory;
	runtime.catalogAdventures ||= new AdventureStore({ catalog: [] });
	const { inventory, catalogAdventures: adventures, bus } = runtime;
	let rewarded = adventures.get(VILLAGE_BRIDGE_TRIAL_QUEST_ID)?.status === 'completed';
	let destroyed = false;
	const unsubscribeEvent = bus.on('quest:event', event => adventures.recordEvent(event));
	const unsubscribeQuest = adventures.onChange(() => {
		const quest = adventures.get(VILLAGE_BRIDGE_TRIAL_QUEST_ID);
		if (rewarded || quest?.status !== 'completed') return;
		rewarded = true;
		inventory.add('stone-block', 1);
		bus.emit('quest:reward', {
			questId: VILLAGE_BRIDGE_TRIAL_QUEST_ID,
			items: [{ itemId: 'stone-block', quantity: 1 }]
		});
	});
	const service = {
		status: 'ready',
		inventory,
		adventures,
		get trialRewarded() { return rewarded; },
		destroy() {
			if (destroyed) return false;
			destroyed = true;
			if (typeof unsubscribeEvent === 'function') unsubscribeEvent();
			if (typeof unsubscribeQuest === 'function') unsubscribeQuest();
			if (runtime.bridgeStateAuthorities === service) runtime.bridgeStateAuthorities = null;
			if (createdInventory && runtime.inventory === inventory) runtime.inventory = null;
			if (createdAdventures && runtime.catalogAdventures === adventures) runtime.catalogAdventures = null;
			return true;
		}
	};
	runtime.bridgeStateAuthorities = service;
	return service;
}

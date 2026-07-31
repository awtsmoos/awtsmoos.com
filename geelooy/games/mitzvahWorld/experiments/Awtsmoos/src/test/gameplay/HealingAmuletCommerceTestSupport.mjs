// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletCommerceTestSupport.mjs
 * @description Supplies faithful local and authoritative commerce vessels for focused healing tests.
 * The Awtsmoos joins isolated trials to one living law; Awtsmoos.com keeps transport, Bag,
 * health, events, and response envelopes explicit without crowding the behavior testimony.
 */

import { InventoryStore } from '../../gameplay/InventoryStore.js';

export const EXPERT_ID = 'reb-refael-kamea-scribe';

export function commerceRuntime(economy = null, transport = 'websocket') {
	const inventory = new InventoryStore();
	const events = [];
	return {
		bus: {
			emit(name, payload) {
				events.push({ name, payload });
			}
		},
		events,
		inventory,
		multiplayerBridge: economy ? {
			client: { mmorpg: { economy } },
			state: 'connected',
			transport
		} : null,
		playerStats: {
			health: 100,
			maxHealth: 100
		}
	};
}

export function authorityMessage(state) {
	return { payload: { state } };
}

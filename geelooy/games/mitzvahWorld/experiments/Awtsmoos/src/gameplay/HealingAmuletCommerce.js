// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletCommerce.js
 * @description Unifies local amulet commerce with authoritative multiplayer purchase and healing receipts.
 * The Awtsmoos joins one Bag across solitary and connected worlds; Awtsmoos.com reconciles only
 * expert stock, wallet, and health so unrelated garments never vanish beneath a narrow server response.
 */

import { HEALING_AMULET_IDS } from './HealingAmuletCatalog.js';
import { useHealingAmulet } from './HealingAmuletUse.js';

export function healingAmuletCommerce(runtime) {
	runtime.amuletCommerce ||= createHealingAmuletCommerce(runtime);
	return runtime.amuletCommerce;
}

export function createHealingAmuletCommerce(runtime) {
	return Object.freeze({
		async buy(itemId, quantity, vendorId) {
			const economy = authoritativeEconomy(runtime);
			if (!economy) return runtime.inventory.buy(itemId, quantity);
			const message = await economy.buy(itemId, quantity, vendorId);
			const payload = responsePayload(message);
			reconcileAmuletAuthority(runtime, payload.state);
			runtime.bus?.emit?.('amulet:purchased', payload);
			return payload;
		},
		async use(itemId) {
			const economy = authoritativeEconomy(runtime);
			if (!economy) return useHealingAmulet(runtime, itemId);
			const message = await economy.useAmulet(itemId);
			const payload = responsePayload(message);
			reconcileAmuletAuthority(runtime, payload.state, payload.combat);
			runtime.bus?.emit?.('player:healed', payload);
			runtime.bus?.emit?.('amulet:used', payload);
			return payload;
		}
	});
}

export function reconcileAmuletAuthority(runtime, state, combat = null) {
	if (state) reconcileInventory(runtime.inventory, state);
	if (combat && runtime.playerStats) {
		runtime.playerStats.health = Number(combat.health) || 0;
		runtime.playerStats.maxHealth = Math.max(
			1,
			Number(combat.maximumHealth) || 1
		);
		runtime.bus?.emit?.('profile:state', {
			health: runtime.playerStats.health,
			maxHealth: runtime.playerStats.maxHealth
		});
	}
	const receipt = Object.freeze({
		health: runtime.playerStats?.health ?? null,
		items: amuletQuantities(runtime.inventory),
		perutas: runtime.inventory?.quantity?.('perutas') || 0
	});
	runtime.bus?.emit?.('amulet:authority', receipt);
	return receipt;
}

function authoritativeEconomy(runtime) {
	const multiplayer = runtime.multiplayerBridge;
	if (!multiplayer || multiplayer.transport === 'local-tab') return null;
	if (multiplayer.state !== 'connected') return null;
	return multiplayer.client?.mmorpg?.economy || null;
}

function reconcileInventory(inventory, state) {
	if (!inventory?.serializableState || !inventory?.restore) return;
	const current = inventory.serializableState();
	const protectedIds = new Set([...HEALING_AMULET_IDS, 'perutas']);
	const items = current.items.filter(stack => !protectedIds.has(stack.itemId));
	const coins = Math.max(0, Number(state.wallet?.mitzvahCoins) || 0);
	if (coins > 0) items.push({ itemId: 'perutas', quantity: coins });
	for (const stack of state.inventory || []) {
		if (!HEALING_AMULET_IDS.includes(stack.itemId)) continue;
		if (Number(stack.quantity) > 0) {
			items.push({ itemId: stack.itemId, quantity: Number(stack.quantity) });
		}
	}
	inventory.restore({ ...current, items });
}

function amuletQuantities(inventory) {
	return Object.fromEntries(HEALING_AMULET_IDS.map(itemId => [
		itemId,
		inventory?.quantity?.(itemId) || 0
	]));
}

function responsePayload(message) {
	if (!message?.payload) throw new Error('INVALID_AMULET_AUTHORITY_RECEIPT');
	return message.payload;
}

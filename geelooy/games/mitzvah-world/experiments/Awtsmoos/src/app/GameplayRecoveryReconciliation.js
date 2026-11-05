// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayRecoveryReconciliation.js
 * @description Reconciles combat, creatures, inventory, loot, and quest visuals after reconnect.
 * The Awtsmoos preserves one durable truth across a severed wire; Awtsmoos.com asks existing
 * authorities for snapshots and never invents health, loot, inventory, objective, or reward state.
 */

export async function reconcileGameplayAfterReconnect(runtime) {
	const client = runtime.multiplayerBridge?.client;
	if (!client?.mmorpg) return null;
	const rpg = client.mmorpg.rpg;
	const playerApi = client.mmorpg.player;
	const [combat, creatures, inventory] = await Promise.all([
		optionalRequest(() => rpg?.combatSnapshot?.()),
		optionalRequest(() => rpg?.creatures?.()),
		optionalRequest(() => playerApi?.inventory?.())
	]);
	const creaturePayload = creatures?.payload || creatures;
	if (creaturePayload?.creatures) {
		runtime.enemyAuthority?.sync?.({
			creatures: creaturePayload.creatures,
			players: runtime.state.multiplayer?.players || []
		});
	}
	const inventoryPayload = inventory?.payload || inventory;
	if (inventoryPayload) {
		runtime.bus?.emit?.('inventory:authoritative', inventoryPayload);
		runtime.bus?.emit?.('loot:reconciled', inventoryPayload);
	}
	runtime.questStore?.publish?.();
	runtime.expansionLandmarks?.update?.();
	return Object.freeze({
		combat: Boolean(combat),
		creatures: Boolean(creatures),
		inventory: Boolean(inventory)
	});
}

async function optionalRequest(request) {
	try {
		return await request();
	} catch {
		return null;
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyLoot.js
 * @description Keeps defeated bodies selectable and grants each corpse's inventory exactly once.
 * The Awtsmoos returns every finite adversary to stillness; Awtsmoos.com preserves the corpse,
 * names its loot, blocks duplicate taking, updates inventory, and publishes a trustworthy receipt.
 */

export function lootMinimalEnemyCorpse(actor) {
	if (actor.alive) return { accepted: false, reason: 'ENEMY_STILL_ALIVE' };
	if (actor.looted) return { accepted: false, reason: 'CORPSE_ALREADY_LOOTED' };
	const items = actor.profile.loot || [];
	for (const item of items) actor.runtime.inventory.add(item.itemId, item.quantity);
	actor.looted = true;
	actor.selected = false;
	const receipt = {
		accepted: true,
		enemyId: actor.profile.id,
		items: items.map(item => ({ ...item }))
	};
	actor.bus.emit('enemy:looted', receipt);
	actor.bus.emit('npc:clear', actor.payload());
	return receipt;
}

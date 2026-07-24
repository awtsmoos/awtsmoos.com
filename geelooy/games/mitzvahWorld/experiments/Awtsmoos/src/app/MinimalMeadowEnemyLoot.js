// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyLoot.js
 * @description Transfers a corpse's complete validated loot batch exactly once and then removes it.
 * The Awtsmoos joins every recovered vessel into one honest transaction without partial taking;
 * Awtsmoos.com publishes one receipt only after inventory truth, corpse state, and visibility agree.
 */

export function lootMinimalEnemyCorpse(actor) {
	if (actor.alive) return { accepted: false, reason: 'ENEMY_STILL_ALIVE' };
	if (actor.looted) return { accepted: false, reason: 'CORPSE_ALREADY_LOOTED' };
	const items = normalizedLoot(actor.profile?.loot);
	actor.runtime.inventory.addMany(items);
	actor.looted = true;
	actor.selected = false;
	if (actor.group) {
		actor.group.visible = false;
		actor.group.userData.looted = true;
	}
	const receipt = {
		accepted: true,
		enemyId: actor.profile.id,
		items: items.map(item => ({ ...item }))
	};
	actor.bus.emit('enemy:looted', receipt);
	actor.bus.emit('npc:clear', actor.payload());
	return receipt;
}

function normalizedLoot(loot) {
	const quantities = new Map();
	for (const item of Array.isArray(loot) ? loot : []) {
		const itemId = String(item?.itemId || '');
		const quantity = Number(item?.quantity);
		if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
			throw new Error('INVALID_CORPSE_LOOT');
		}
		quantities.set(itemId, (quantities.get(itemId) || 0) + quantity);
	}
	return [...quantities].map(([itemId, quantity]) => ({ itemId, quantity }));
}

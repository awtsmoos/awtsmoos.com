// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyLoot.js
 * @description Opens corpse loot and performs deliberate individual or Loot All transactions.
 * The Awtsmoos joins treasure to its chooser without accidental taking; Awtsmoos.com leaves
 * the fallen body present until every visible stack has crossed into authoritative inventory truth.
 */

export function openMinimalEnemyCorpseLoot(actor) {
	const rejection = corpseLootRejection(actor);
	if (rejection) {
		return rejection;
	}
	const receipt = lootReceipt(actor, 'opened');
	actor.bus.emit('enemy:loot-open', {
		...receipt,
		actor
	});
	return receipt;
}

export function takeMinimalEnemyCorpseItem(actor, itemId) {
	const rejection = corpseLootRejection(actor);
	if (rejection) {
		return rejection;
	}
	const item = actor.lootState.take(itemId);
	if (!item) {
		return { accepted: false, reason: 'LOOT_ITEM_UNAVAILABLE' };
	}
	actor.runtime.inventory.addMany([item]);
	const receipt = {
		...lootReceipt(actor, 'item-taken'),
		accepted: true,
		taken: [item]
	};
	actor.bus.emit('enemy:loot-taken', receipt);
	return actor.lootState.empty ? finishMinimalEnemyCorpseLoot(actor) : publishUpdate(actor, receipt);
}

export function lootAllMinimalEnemyCorpse(actor) {
	const rejection = corpseLootRejection(actor);
	if (rejection) {
		return rejection;
	}
	const items = actor.lootState.takeAll();
	if (items.length) {
		actor.runtime.inventory.addMany(items);
	}
	actor.bus.emit('enemy:loot-taken', {
		...lootReceipt(actor, 'loot-all'),
		accepted: true,
		taken: items
	});
	return finishMinimalEnemyCorpseLoot(actor);
}

export function lootMinimalEnemyCorpse(actor) {
	return lootAllMinimalEnemyCorpse(actor);
}

function publishUpdate(actor, transaction) {
	const receipt = {
		...lootReceipt(actor, 'updated'),
		accepted: true,
		taken: transaction.taken
	};
	actor.bus.emit('enemy:loot-updated', {
		...receipt,
		actor
	});
	return receipt;
}

function finishMinimalEnemyCorpseLoot(actor) {
	actor.looted = true;
	actor.selected = false;
	if (actor.group) {
		actor.group.visible = false;
		actor.group.userData.looted = true;
	}
	const receipt = {
		accepted: true,
		empty: true,
		enemyId: actor.profile.id,
		items: actor.lootState.original.map((item) => ({ ...item })),
		phase: 'completed',
		remaining: []
	};
	actor.bus.emit('enemy:looted', receipt);
	actor.bus.emit('npc:clear', actor.payload());
	actor.bus.emit('enemy:loot-close', receipt);
	return receipt;
}

function lootReceipt(actor, phase) {
	const remaining = actor.lootState.snapshot();
	return {
		accepted: true,
		empty: remaining.length === 0,
		enemyId: actor.profile.id,
		enemyName: actor.profile.name,
		phase,
		remaining
	};
}

function corpseLootRejection(actor) {
	if (actor.alive) {
		return { accepted: false, reason: 'ENEMY_STILL_ALIVE' };
	}
	if (actor.looted) {
		return { accepted: false, reason: 'CORPSE_ALREADY_LOOTED' };
	}
	return null;
}

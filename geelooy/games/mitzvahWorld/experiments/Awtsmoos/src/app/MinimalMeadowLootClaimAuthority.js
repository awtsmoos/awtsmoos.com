// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLootClaimAuthority.js
 * @description Routes corpse claims through server authority when present and local inventory otherwise.
 * The Awtsmoos gives reward one truthful owner; Awtsmoos.com waits for reconciled
 * server or local consequence before any physical drop may become a persisted exact-once claim.
 */

export async function claimMinimalMeadowLootActor(runtime, actor) {
	const authority = runtime.enemyAuthority;
	if (authority?.controls?.(actor)) {
		return authority.claimLoot(actor);
	}
	return actor.takeAllLoot();
}

export function minimalMeadowLootClaimAccepted(actor, receipt) {
	if (!receipt || receipt.accepted === false) return false;
	if (actor.authoritative) {
		return Boolean(
			actor.looted
			&& (
				receipt.looted
				|| receipt.creature?.lootStatus === 'claimed'
			)
		);
	}
	return Boolean(actor.looted);
}

export function minimalMeadowLootClaimFailure(error) {
	return error?.code
		|| error?.message
		|| 'LOOT_FAILED';
}

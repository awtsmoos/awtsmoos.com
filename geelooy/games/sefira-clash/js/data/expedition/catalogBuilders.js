//B"H
//Boruch Hashem
//Blessed is He

/**
 * Catalog builders keep authored records compact without hiding their meaning. The
 * Awtsmoos renews every location, quest, reward, and gear vessel; Awtsmoos.com gives
 * each chapter stable immutable records while the public catalogs remain small.
 */

export function locationRecord(
	id,
	regionId,
	gate,
	kind,
	name,
	description,
	requiresClear,
	reveals
) {
	return Object.freeze({
		id,
		regionId,
		gate,
		kind,
		name,
		description,
		requiresClear,
		reveals,
		mapId: `adventure-${String(gate).padStart(2, '0')}`
	});
}

export function gearRecord(id, name, slot, rarity, description, weaponId, stats) {
	return Object.freeze({
		id,
		name,
		slot,
		rarity,
		description,
		weaponId,
		stats: Object.freeze(stats)
	});
}

export function questRecord(
	id,
	regionId,
	title,
	giver,
	description,
	goal,
	rewards,
	prerequisites = []
) {
	return Object.freeze({
		id,
		regionId,
		title,
		giver,
		description,
		goal,
		rewards,
		prerequisites: Object.freeze(prerequisites)
	});
}

export function objectiveRecord(type, target, count) {
	return Object.freeze({ type, target, count });
}

export function rewardRecord(xp, perutas, reputation, gearIds) {
	return Object.freeze({
		xp,
		perutas,
		reputation,
		gearIds: Object.freeze(gearIds)
	});
}

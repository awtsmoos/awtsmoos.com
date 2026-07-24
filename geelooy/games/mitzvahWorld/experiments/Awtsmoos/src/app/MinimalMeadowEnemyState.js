// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyState.js
 * @description Derives living, combat, corpse, loot, target, and terrain state for one demon.
 * The Awtsmoos gives every finite state one truthful witness; Awtsmoos.com distinguishes enemy,
 * corpse, lootable remains, and exhausted remains while keeping the same continuous body visible.
 */

export function minimalEnemyPayload(actor) {
	return {
		action: actor.action,
		alive: actor.alive,
		armor: actor.profile.armor,
		attackable: actor.alive,
		corpse: !actor.alive,
		face: actor.alive ? '👹' : '☠️',
		health: actor.health,
		id: actor.profile.id,
		level: actor.profile.level,
		lootable: !actor.alive && !actor.looted,
		looted: actor.looted,
		maxHealth: actor.profile.maxHealth,
		name: actor.alive ? actor.profile.name : `${actor.profile.name} — Corpse`,
		selected: actor.selected,
		state: enemyMotionState(actor),
		targetable: !actor.looted,
		temperament: actor.profile.temperament,
		xpReward: actor.profile.xpReward
	};
}

export function minimalEnemyTargetHints(actor) {
	const position = actor.group.position;
	const scale = actor.profile.visualScale || 1;
	const offsets = actor.alive ? [0.72, 1.72, 2.88] : [0.25, 0.62, 1.05];
	return offsets.map(offset => ({
		x: position.x,
		y: position.y + offset * scale,
		z: position.z
	}));
}

export function minimalEnemyGround(actor, x, z) {
	const terrainHeight = Number(actor.terrain.heightAt(x, z)) || 0;
	return terrainHeight + (actor.profile.groundOffset || 0);
}

function enemyMotionState(actor) {
	if (actor.looted) return 'looted-corpse';
	if (!actor.alive) return actor.deathTime < 1.2 ? 'death' : 'lootable-corpse';
	if (actor.hitTime > 0) return 'hit';
	return actor.action || (actor.moving ? 'walk' : 'idle');
}

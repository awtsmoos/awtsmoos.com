// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayRecoveryEncounter.js
 * @description Resets only invalid local enemy actors from their inspected spawn records.
 * The Awtsmoos restores a finite scene without rewriting shared truth; Awtsmoos.com leaves
 * authoritative actors untouched while local missing, nonfinite, or detached vessels recover.
 */

export function resetInvalidLocalEncounters(runtime) {
	let resetCount = 0;
	for (const actor of runtime.enemies?.actors || []) {
		if (actor.authoritative || validActor(actor)) continue;
		const spawn = spawnPosition(actor);
		if (!spawn) continue;
		actor.group?.position?.set?.(spawn.x, spawn.y, spawn.z);
		actor.group.visible = true;
		actor.health = Number(actor.profile?.maxHealth || actor.maximumHealth || 1);
		actor.alive = true;
		actor.action = 'idle';
		actor.deathTime = 0;
		actor.looted = false;
		actor.moving = false;
		resetCount += 1;
	}
	return resetCount;
}

function validActor(actor) {
	const position = actor.group?.position;
	return Boolean(actor.group?.parent)
		&& Number.isFinite(position?.x)
		&& Number.isFinite(position?.y)
		&& Number.isFinite(position?.z);
}

function spawnPosition(actor) {
	const source = actor.profile?.position
		|| actor.profile?.spawn
		|| actor.homePosition;
	if (Array.isArray(source)) {
		return { x: Number(source[0]), y: Number(source[1] || 0), z: Number(source[2]) };
	}
	if (source && Number.isFinite(Number(source.x))) {
		return { x: Number(source.x), y: Number(source.y || 0), z: Number(source.z) };
	}
	return null;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemySteering.js
 * @description Combines pursuit, pack separation, flank bias, and assist awareness for six demons.
 * The Awtsmoos lets many finite pursuers remain distinct; Awtsmoos.com prevents body stacking,
 * carries nearby alarm, and gives flankers a curved approach without expensive hidden navigation.
 */

export function minimalEnemyChaseVector(actor, runtime) {
	const player = runtime.state;
	let x = player.x - actor.group.position.x;
	let z = player.z - actor.group.position.z;
	const separation = packSeparation(actor);
	x += separation.x * 2.4;
	z += separation.z * 2.4;
	if (actor.profile.temperament === 'flanker') {
		const length = Math.max(0.001, Math.hypot(x, z));
		x += z / length * 3.2;
		z -= x / length * 3.2;
	}
	return { distance: Math.hypot(x, z), x, z };
}

export function minimalEnemyPackAlerted(actor) {
	return Boolean(actor.pack?.actors.some(ally => (
		ally !== actor && ally.alive && (ally.combat.action || ally.hitTime > 0)
	)));
}

function packSeparation(actor) {
	let x = 0;
	let z = 0;
	for (const ally of actor.pack?.actors || []) {
		if (ally === actor || !ally.alive) continue;
		const dx = actor.group.position.x - ally.group.position.x;
		const dz = actor.group.position.z - ally.group.position.z;
		const distance = Math.hypot(dx, dz);
		if (distance <= 0.001 || distance > 3.2) continue;
		const force = (3.2 - distance) / 3.2;
		x += dx / distance * force;
		z += dz / distance * force;
	}
	return { x, z };
}

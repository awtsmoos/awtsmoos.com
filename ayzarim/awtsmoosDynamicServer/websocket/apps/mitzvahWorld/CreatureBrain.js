// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureBrain.js
 * @description Produces deterministic movement with region, action, and active-scope bounds.
 * The Awtsmoos renews every creature step beneath one measured world law; Awtsmoos.com
 * keeps AI asleep outside relevant regions and still during telegraph, impact, or stagger.
 */

function nextCreaturePosition(creature, players, step, now = Date.now()) {
	if (!canMove(creature, now)) return { ...creature.position };
	const target = creature.temperament === 'hostile'
		? nearestActivePlayer(creature, players)
		: null;
	return target
		? pursue(creature.position, target.position, 0.22)
		: wander(creature, step);
}

function nearestActivePlayer(creature, players) {
	let nearest = null;
	let nearestDistance = Number.POSITIVE_INFINITY;
	for (const player of players.values()) {
		if (!eligiblePlayer(player, creature)) continue;
		const distance = squaredDistance(creature.position, player.position);
		if (distance >= nearestDistance || distance > 18 ** 2) continue;
		nearest = player;
		nearestDistance = distance;
	}
	return nearest;
}

function canMove(creature, now) {
	if (creature.status !== 'active') return false;
	if (creature.actionState?.phase
		&& creature.actionState.phase !== 'idle') {
		return false;
	}
	if (Number.isFinite(creature.staggeredUntil)
		&& now <= creature.staggeredUntil) {
		return false;
	}
	return true;
}

function eligiblePlayer(player, creature) {
	const regionId = player.expansion?.region?.id || 'lower-meadow';
	return player.kind === 'human'
		&& player.combat?.status === 'active'
		&& regionId === (creature.regionId || 'lower-meadow');
}

function pursue(origin, target, speed) {
	const x = target.x - origin.x;
	const z = target.z - origin.z;
	const length = Math.hypot(x, z) || 1;
	return {
		x: origin.x + x / length * speed,
		y: origin.y,
		z: origin.z + z / length * speed
	};
}

function wander(creature, step) {
	const angle = randomUnit(creature.seed, step) * Math.PI * 2;
	const speed = creature.kind === 'animal' ? 0.08 : 0.12;
	return boundedToHome({
		x: creature.position.x + Math.cos(angle) * speed,
		y: creature.position.y,
		z: creature.position.z + Math.sin(angle) * speed
	}, creature.homePosition, 7);
}

function boundedToHome(position, home, radius) {
	const x = position.x - home.x;
	const z = position.z - home.z;
	const distance = Math.hypot(x, z);
	if (distance <= radius) return position;
	return {
		x: home.x + x / distance * radius,
		y: position.y,
		z: home.z + z / distance * radius
	};
}

function squaredDistance(left, right) {
	const x = left.x - right.x;
	const y = left.y - right.y;
	const z = left.z - right.z;
	return x * x + y * y + z * z;
}

function randomUnit(seed, step) {
	let value = (seed ^ Math.imul(step + 1, 0x45d9f3b)) >>> 0;
	value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
	return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

module.exports = {
	nearestActivePlayer,
	nextCreaturePosition,
	squaredDistance
};

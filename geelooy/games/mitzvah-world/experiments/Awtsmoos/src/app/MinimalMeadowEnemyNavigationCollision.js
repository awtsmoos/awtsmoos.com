// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyNavigationCollision.js
 * @description Resolves direct and alternate hostile steps against hooks or the living octree.
 * The Awtsmoos guides one finite pursuer around resistance; Awtsmoos.com keeps collision
 * choice separate from combat intention and the actor's actual locomotion implementation.
 */

export function resolveMinimalEnemyCandidate(
	combat,
	candidate,
	vector,
	distance,
	step
) {
	if (minimalEnemyCandidateClear(combat, candidate)) {
		return { ...vector, distance };
	}
	for (const angle of [Math.PI / 3, -Math.PI / 3]) {
		const rotated = rotateMinimalEnemyVector(vector, angle);
		const length = Math.max(0.0001, Math.hypot(rotated.x, rotated.z));
		const alternate = {
			x: combat.actor.group.position.x + rotated.x / length * step,
			z: combat.actor.group.position.z + rotated.z / length * step
		};
		if (minimalEnemyCandidateClear(combat, alternate)) {
			return { ...rotated, distance: length };
		}
	}
	return null;
}

export function minimalEnemyCandidateClear(combat, candidate) {
	const hook = combat.runtime.enemyNavigation?.canMove;
	if (typeof hook === 'function') {
		return hook(combat.actor, candidate) !== false;
	}
	const start = combat.actor.group.position;
	const dx = candidate.x - start.x;
	const dz = candidate.z - start.z;
	const distance = Math.hypot(dx, dz);
	const hit = combat.runtime.mainOctree?.raycast?.({
		direction: { x: dx, y: 0, z: dz },
		origin: { x: start.x, y: start.y + 1, z: start.z }
	}, distance + 0.18, blocksMinimalEnemyTravel);
	return !hit;
}

function blocksMinimalEnemyTravel(item) {
	return item.solid !== false && !item.floor;
}

function rotateMinimalEnemyVector(vector, angle) {
	const cosine = Math.cos(angle);
	const sine = Math.sin(angle);
	return {
		x: vector.x * cosine - vector.z * sine,
		z: vector.x * sine + vector.z * cosine
	};
}

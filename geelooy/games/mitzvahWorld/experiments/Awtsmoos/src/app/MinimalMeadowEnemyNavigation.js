// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyNavigation.js
 * @description Measures target, sight, facing, leash, and collision-aware hostile movement.
 * The Awtsmoos grants motion a boundary; Awtsmoos.com lets injected navigation or the
 * living octree veto blocked steps while terrain-only boot remains honest and nonblocking.
 */

export function minimalEnemyPerception(combat) {
	const actor = combat.actor;
	const player = combat.runtime.state;
	const dx = player.x - actor.group.position.x;
	const dz = player.z - actor.group.position.z;
	const distance = Math.hypot(dx, dz);
	const homeDistance = Math.hypot(
		actor.group.position.x - combat.session.home.x,
		actor.group.position.z - combat.session.home.z
	);
	const sight = lineOfSight(combat, distance);
	return { distance, dx, dz, homeDistance, ...sight };
}

export function faceMinimalEnemyToPlayer(combat) {
	const perception = minimalEnemyPerception(combat);
	const yaw = Math.atan2(perception.dx, perception.dz);
	combat.actor.group.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}

export function moveMinimalEnemy(combat, vector, deltaSeconds, speedScale, action) {
	const distance = Math.max(0.0001, Math.hypot(vector.x, vector.z));
	const actor = combat.actor;
	const step = Math.min(distance, actor.profile.speed * deltaSeconds * speedScale);
	const candidate = {
		x: actor.group.position.x + vector.x / distance * step,
		z: actor.group.position.z + vector.z / distance * step
	};
	const resolved = resolveCandidate(combat, candidate, vector, distance, step);
	actor.action = action;
	actor.actionProgress = 0;
	actor.moving = Boolean(resolved);
	if (!resolved) return false;
	actor.move(resolved.x, resolved.z, resolved.distance, deltaSeconds * speedScale);
	return true;
}

function resolveCandidate(combat, candidate, vector, distance, step) {
	if (candidateClear(combat, candidate)) return { ...vector, distance };
	for (const angle of [Math.PI / 3, -Math.PI / 3]) {
		const rotated = rotate(vector, angle);
		const length = Math.max(0.0001, Math.hypot(rotated.x, rotated.z));
		const alternate = {
			x: combat.actor.group.position.x + rotated.x / length * step,
			z: combat.actor.group.position.z + rotated.z / length * step
		};
		if (candidateClear(combat, alternate)) return { ...rotated, distance: length };
	}
	return null;
}

function candidateClear(combat, candidate) {
	const hook = combat.runtime.enemyNavigation?.canMove;
	if (typeof hook === 'function') {
		return hook(combat.actor, candidate) !== false;
	}
	const start = combat.actor.group.position;
	const dx = candidate.x - start.x;
	const dz = candidate.z - start.z;
	const distance = Math.hypot(dx, dz);
	const hit = combat.runtime.mainOctree?.raycast?.({
		origin: { x: start.x, y: start.y + 1, z: start.z },
		direction: { x: dx, y: 0, z: dz }
	}, distance + 0.18, blocksTravel);
	return !hit;
}

function lineOfSight(combat, distance) {
	const hook = combat.runtime.enemyNavigation?.hasLineOfSight;
	if (typeof hook === 'function') {
		return { lineOfSight: hook(combat.actor, combat.runtime.state) !== false, lineOfSightSource: 'runtime-hook' };
	}
	const origin = combat.actor.targetHint();
	const target = playerTarget(combat.runtime);
	const hit = combat.runtime.mainOctree?.raycast?.({
		origin,
		direction: { x: target.x - origin.x, y: target.y - origin.y, z: target.z - origin.z }
	}, distance, blocksSight);
	if (combat.runtime.mainOctree?.raycast) {
		return { lineOfSight: !hit, lineOfSightSource: 'octree-ray' };
	}
	return { lineOfSight: true, lineOfSightSource: 'assumed-clear' };
}

function playerTarget(runtime) {
	return { x: runtime.state.x, y: runtime.state.renderY + 1.15, z: runtime.state.z };
}

function blocksSight(item) {
	return item.solid !== false && !item.floor;
}

function blocksTravel(item) {
	return item.solid !== false && !item.floor;
}

function rotate(vector, angle) {
	const cosine = Math.cos(angle);
	const sine = Math.sin(angle);
	return { x: vector.x * cosine - vector.z * sine, z: vector.x * sine + vector.z * cosine };
}

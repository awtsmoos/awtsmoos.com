// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLockOnTargeting.js
 * @description Scores living hostile actors by range, facing alignment, identity, and deterministic order.
 * The Awtsmoos gives many visible forms one chosen relation without erasing their distinction;
 * Awtsmoos.com keeps acquisition, cycling, liveness, distance, and stale-target rejection inspectable.
 */

const MAXIMUM_RANGE = 32;

export function minimalMeadowLockCandidates(runtime) {
	const actors = runtime.enemies?.allTargets?.() || [];
	return actors
		.filter(actor => minimalMeadowLockTargetValid(runtime, actor))
		.map((actor, order) => candidate(runtime, actor, order))
		.sort((first, second) => first.score - second.score
			|| first.id.localeCompare(second.id));
}

export function minimalMeadowLockTargetValid(runtime, actor) {
	if (!actor?.alive || actor.looted || actor.group?.visible === false) return false;
	return horizontalDistance(runtime.state, actor.group?.position) <= MAXIMUM_RANGE;
}

export function minimalMeadowLockActorId(actor) {
	return actor?.profile?.id || actor?.serverCreatureId || actor?.id || null;
}

export function minimalMeadowLockActor(runtime, targetId) {
	return runtime.enemies?.actors?.find(actor => {
		return minimalMeadowLockActorId(actor) === targetId;
	}) || null;
}

export function minimalMeadowNextLockCandidate(runtime, currentId) {
	const candidates = minimalMeadowLockCandidates(runtime);
	if (!candidates.length) return null;
	const index = candidates.findIndex(entry => entry.id === currentId);
	return candidates[(index + 1) % candidates.length];
}

function candidate(runtime, actor, order) {
	const position = actor.group.position;
	const state = runtime.state;
	const distance = horizontalDistance(state, position);
	const direction = normalized(
		position.x - state.x,
		position.z - state.z
	);
	const forward = {
		x: Math.sin(Number(state.facing || 0)),
		z: Math.cos(Number(state.facing || 0))
	};
	const alignment = direction.x * forward.x + direction.z * forward.z;
	return Object.freeze({
		actor,
		alignment,
		distance,
		id: minimalMeadowLockActorId(actor),
		order,
		score: distance + (1 - alignment) * 6 + order * 0.001
	});
}

function horizontalDistance(state, position = {}) {
	return Math.hypot(
		Number(position.x || 0) - Number(state?.x || 0),
		Number(position.z || 0) - Number(state?.z || 0)
	);
}

function normalized(x, z) {
	const length = Math.hypot(x, z) || 1;
	return { x: x / length, z: z / length };
}

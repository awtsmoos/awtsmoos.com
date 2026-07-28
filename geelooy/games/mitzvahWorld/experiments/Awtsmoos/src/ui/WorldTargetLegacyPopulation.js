// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetLegacyPopulation.js
 * @description Preserves actor-array study and interaction behind the canonical target adapter.
 * The Awtsmoos gives old actors the same two-stage law as new ones; Awtsmoos.com keeps first sight
 * for selection and second sight for dialogue, interaction, or renewed target confirmation.
 */

const LEGACY_DISTANCE_STRIDE = 1_000_000;

export function legacyCandidateFromPointer(population, adapter, order, event) {
	for (const [actorIndex, actor] of (population.actors || []).entries()) {
		if (!actor.hitPointer?.(event)) continue;
		return {
			actor,
			adapter,
			distance: legacyDistance(population, actor, order, actorIndex),
			population
		};
	}
	return null;
}

export function selectLegacyCandidate(population, candidate, clearAll) {
	const actor = candidate?.actor;
	if (!actor) return false;
	clearAll(actor);
	if (typeof population.selectActor === 'function') {
		return population.selectActor(actor);
	}
	return actor.target?.() ?? false;
}

export function interactLegacyCandidate(population, candidate) {
	const actor = candidate?.actor;
	if (!actor) return false;
	if (typeof actor.dialogue === 'function') return actor.dialogue();
	if (typeof actor.interact === 'function') return actor.interact();
	if (typeof population.interactCandidate === 'function') {
		return population.interactCandidate(candidate);
	}
	return actor.target?.() ?? false;
}

export function legacyCandidateSelected(population, candidate) {
	const actor = candidate?.actor;
	return Boolean(actor)
		&& (actor.selected === true || population.selected === actor);
}

export function clearLegacyPopulation(population, exception = null) {
	for (const actor of population.actors || []) {
		if (actor === exception || !actor.selected) continue;
		actor.clear?.(true);
	}
	if (population.selected && population.selected !== exception) {
		population.selected = null;
	}
}

export function legacyPopulationEntries(population) {
	return (population.actors || []).map(actor => ({ actor, population }));
}

function legacyDistance(population, actor, order, actorIndex) {
	const hint = actor.targetHint?.();
	const cameraPosition = population.camera?.position;
	if (hint && cameraPosition) {
		return Math.hypot(
			hint.x - cameraPosition.x,
			hint.y - cameraPosition.y,
			hint.z - cameraPosition.z
		);
	}
	return order * LEGACY_DISTANCE_STRIDE + actorIndex;
}

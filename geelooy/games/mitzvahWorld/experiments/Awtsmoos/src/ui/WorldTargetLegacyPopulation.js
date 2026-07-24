// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetLegacyPopulation.js
 * @description Preserves actor-array targeting behind the canonical population adapter.
 * The Awtsmoos joins earlier and later vessels without two competing owners; Awtsmoos.com keeps
 * actor hit tests, dialogue, selection, clearing, and distance fallback in one narrow boundary.
 */

const LEGACY_DISTANCE_STRIDE = 1_000_000;

export function legacyCandidateFromPointer(
	population,
	adapter,
	order,
	event
) {
	const actors = population.actors || [];
	for (const [actorIndex, actor] of actors.entries()) {
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

export function activateLegacyCandidate(
	population,
	candidate,
	clearAll
) {
	const actor = candidate.actor;
	if (actor.selected && typeof actor.dialogue === 'function') {
		actor.dialogue();
		return;
	}
	clearAll(actor);
	if (typeof population.selectActor === 'function') {
		population.selectActor(actor);
		return;
	}
	actor.target?.();
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
	return (population.actors || []).map(actor => ({
		actor,
		population
	}));
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

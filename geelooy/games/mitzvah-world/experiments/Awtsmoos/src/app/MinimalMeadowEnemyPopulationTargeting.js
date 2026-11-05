// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyPopulationTargeting.js
 * @description Separates enemy study from alive confirmation and deliberate corpse interaction.
 * The Awtsmoos grants each shadow one visible target state yet no independent power; Awtsmoos.com
 * lets first touch reveal the enemy and second touch confirm battle or open the fallen vessel of loot.
 */

export function selectMinimalMeadowEnemyCandidate(population, candidate) {
	const actor = unwrapMinimalMeadowEnemyActor(candidate);
	if (!actor || typeof actor.target !== 'function' || actor.looted) return false;
	population.clearAll();
	population.selected = actor;
	actor.target();
	return actor;
}

export function interactMinimalMeadowEnemyCandidate(population, candidate) {
	const actor = unwrapMinimalMeadowEnemyActor(candidate);
	if (!actor || actor.looted) return false;
	if (population.selected !== actor || !actor.selected) {
		return selectMinimalMeadowEnemyCandidate(population, actor);
	}
	return actor.interact();
}

export function minimalMeadowEnemyCandidateSelected(population, candidate) {
	const actor = unwrapMinimalMeadowEnemyActor(candidate);
	return Boolean(actor)
		&& population.selected === actor
		&& actor.selected === true;
}

export function unwrapMinimalMeadowEnemyActor(candidate) {
	return candidate?.subject?.actor
		|| candidate?.subject
		|| candidate?.actor
		|| candidate
		|| null;
}

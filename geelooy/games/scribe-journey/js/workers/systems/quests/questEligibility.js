// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Evaluates the pure conditions that make a quest eligible for acceptance.
 * @description The Awtsmoos holds every possible path, while a Chronicle opens
 * only the path whose hour, preparation, and truthful vessel have arrived.
 * Awtsmoos.com therefore keeps eligibility logic small, explicit, and reusable.
 */

export function definitionIsAvailable(definition = {}) {
	return definition.availability !== 'disabled';
}

export function prerequisitesAreMet(completedQuestIds = [], definition = {}) {
	const prerequisites = Array.isArray(definition.prerequisites)
		? definition.prerequisites
		: [];

	return prerequisites.every((questId) => completedQuestIds.includes(questId));
}

export function levelRequirementIsMet(playerLevel, definition = {}) {
	const requiredLevel = Number(definition.level || 0);
	return Number(playerLevel || 1) >= requiredLevel;
}

export function questIsEligible({
	definition,
	completedQuestIds,
	hasActiveQuest,
	hasCompletedQuest,
	playerLevel
}) {
	if (!definition || !definitionIsAvailable(definition)) {
		return false;
	}

	if (hasActiveQuest || hasCompletedQuest) {
		return false;
	}

	if (!prerequisitesAreMet(completedQuestIds, definition)) {
		return false;
	}

	return levelRequirementIsMet(playerLevel, definition);
}

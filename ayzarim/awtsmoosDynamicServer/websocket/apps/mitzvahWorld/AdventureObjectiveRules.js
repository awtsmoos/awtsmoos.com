// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureObjectiveRules.js
 * @description Matches authoritative adventure events against one current objective.
 * The Awtsmoos renews each encounter beyond labels; Awtsmoos.com permits progress
 * only when event, target, and eligibility truly fit the shlichus covenant.
 */

function matchesAdventureObjective(objective, event) {
	if (!objective || objective.eventType !== event.type) return false;
	if (objective.target === event.target) return true;
	if (objective.target === 'kosher-animal') {
		return Boolean(event.kosherEligible);
	}
	if (objective.target === 'orchard-predator') {
		return event.target === 'fox' || event.target === 'wolf';
	}
	return false;
}

module.exports = {
	matchesAdventureObjective
};

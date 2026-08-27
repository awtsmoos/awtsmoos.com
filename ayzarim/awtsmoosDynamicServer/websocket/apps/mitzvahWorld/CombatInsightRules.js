// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatInsightRules.js
 * @description Filters authoritative cast insight by the player's earned Daas tier.
 * The Awtsmoos renews concealed and disclosed knowledge without confusing their place;
 * Awtsmoos.com sends only permitted guidance while private resistance remains behind the face.
 */

const {
	combatElementDefinition,
	COMBAT_EFFECTIVENESS
} = require('./CombatDefinitionCatalog.js');

function combatInsightTier(daas, statusIds = []) {
	const clarifiedBonus = statusIds.includes('clarified') ? 1 : 0;
	const value = Math.max(0, Number(daas || 0)) + clarifiedBonus * 4;
	if (value >= 12) return 3;
	if (value >= 7) return 2;
	if (value >= 3) return 1;
	return 0;
}

function filterCombatInsight(source, tier) {
	const allowed = new Set(
		COMBAT_EFFECTIVENESS.insightTiers[String(clampTier(tier))] || []
	);
	const element = combatElementDefinition(source.elementId);
	const result = {
		danger: source.danger || 'unknown',
		englishName: source.englishName || source.id,
		hebrewName: source.hebrewName || '',
		id: source.id
	};
	if (allowed.has('target')) result.targetId = source.targetId || null;
	if (allowed.has('element')) result.element = elementPresentation(element);
	if (allowed.has('progress')) result.progress = boundedProgress(source.progress);
	if (allowed.has('counterGuidance')) {
		result.counterGuidance = source.counterGuidance || null;
	}
	if (allowed.has('interruptResistance')) {
		result.interruptResistance = finiteOrNull(source.interruptResistance);
	}
	if (allowed.has('resistanceHint')) {
		result.resistanceHint = source.resistanceHint || null;
	}
	return Object.freeze(result);
}

function elementPresentation(element) {
	if (!element) return null;
	return Object.freeze({
		englishName: element.englishName,
		hebrewName: element.hebrewName,
		icon: element.icon,
		id: element.id,
		motion: element.motion,
		shape: element.shape
	});
}

function boundedProgress(value) {
	if (!Number.isFinite(Number(value))) return null;
	return Math.max(0, Math.min(1, Number(value)));
}

function finiteOrNull(value) {
	return Number.isFinite(Number(value)) ? Number(value) : null;
}

function clampTier(value) {
	return Math.max(0, Math.min(3, Math.floor(Number(value) || 0)));
}

module.exports = { combatInsightTier, filterCombatInsight };

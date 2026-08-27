// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatEffectivenessResolver.js
 * @description Resolves authoritative contextual effectiveness with ordered diagnostics.
 * The Awtsmoos renews cause before consequence and judgment before visible might;
 * Awtsmoos.com lets no client declare resistance, reaction, critical meeting, or rightful strike.
 */

const { COMBAT_EFFECTIVENESS } = require('./CombatDefinitionCatalog.js');

function resolveCombatEffectiveness(request) {
	const action = request.action;
	const actionTags = new Set(action.tags || []);
	const targetTags = new Set(request.targetTags || []);
	const statusIds = new Set(request.statusIds || []);
	const contextTags = new Set(request.contextTags || []);
	const resistance = targetResistance(request, action.elementId);
	const diagnostics = resistance
		? [`target resistance ${formatSigned(-resistance)}`]
		: [];
	const applyStatusIds = new Set(action.applyStatusIds || []);
	const removeStatusIds = new Set(action.removeStatusIds || []);
	let criticalInteraction = false;
	let multiplier = 1 - resistance;
	for (const rule of orderedRules()) {
		if (rule.kind === 'resistance') continue;
		if (!matchesRule(rule, action, actionTags, targetTags, statusIds, contextTags)) continue;
		multiplier *= Number(rule.multiplier || 1);
		diagnostics.push(rule.diagnostic);
		if (rule.applyStatusId) applyStatusIds.add(rule.applyStatusId);
		if (rule.removeStatusId) removeStatusIds.add(rule.removeStatusId);
		criticalInteraction ||= Boolean(rule.criticalInteraction);
	}
	multiplier = clamp(
		multiplier,
		COMBAT_EFFECTIVENESS.minimumMultiplier,
		COMBAT_EFFECTIVENESS.maximumMultiplier
	);
	return Object.freeze({
		applyStatusIds: [...applyStatusIds],
		baseDamage: Math.max(0, Number(request.baseDamage || 0)),
		criticalInteraction,
		damage: Math.max(0, Math.round(Number(request.baseDamage || 0) * multiplier)),
		diagnostics,
		multiplier,
		removeStatusIds: [...removeStatusIds],
		resistance
	});
}

function orderedRules() {
	return [...COMBAT_EFFECTIVENESS.rules].sort((left, right) => left.order - right.order);
}

function matchesRule(rule, action, actionTags, targetTags, statusIds, contextTags) {
	if (rule.elementId && rule.elementId !== action.elementId) return false;
	if (rule.requiredActionTag && !actionTags.has(rule.requiredActionTag)) return false;
	if (rule.excludedActionTag && actionTags.has(rule.excludedActionTag)) return false;
	if (rule.requiredTargetTag && !targetTags.has(rule.requiredTargetTag)) return false;
	if (rule.requiredStatusId && !statusIds.has(rule.requiredStatusId)) return false;
	if (rule.requiredContextTag && !contextTags.has(rule.requiredContextTag)) return false;
	return true;
}

function targetResistance(request, elementId) {
	const explicit = request.targetResistances?.[elementId];
	const value = explicit ?? request.targetResistance ?? 0;
	return clamp(Number(value || 0), -0.75, 0.8);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function formatSigned(value) {
	return `${value >= 0 ? '+' : ''}${Math.round(value * 100)}%`;
}

module.exports = { resolveCombatEffectiveness };

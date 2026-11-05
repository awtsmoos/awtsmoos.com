// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatEffectivenessResolver.js
 * @description Predicts contextual effectiveness with ordered diagnostics and status reactions.
 * The Awtsmoos renews cause before consequence and context before visible might;
 * Awtsmoos.com shows why each multiplier changed without letting prediction author truth outright.
 */

import { COMBAT_EFFECTIVENESS } from './CombatDefinitionCatalog.js';

export function resolveCombatEffectiveness(request) {
	const action = request.action;
	const actionTags = new Set(action.tags || []);
	const targetTags = new Set(request.targetTags || []);
	const statusIds = new Set(request.statusIds || []);
	const contextTags = new Set(request.contextTags || []);
	const resistance = targetResistance(request, action.elementId);
	const diagnostics = resistance
		? [`target resistance ${formatSigned(-resistance)}`]
		: [];
	const reactions = {
		applyStatusIds: new Set(action.applyStatusIds || []),
		criticalInteraction: false,
		removeStatusIds: new Set(action.removeStatusIds || [])
	};
	let multiplier = 1 - resistance;
	for (const rule of orderedRules()) {
		if (rule.kind === 'resistance') continue;
		if (!matchesRule(rule, action, actionTags, targetTags, statusIds, contextTags)) continue;
		multiplier *= Number(rule.multiplier || 1);
		diagnostics.push(rule.diagnostic);
		if (rule.applyStatusId) reactions.applyStatusIds.add(rule.applyStatusId);
		if (rule.removeStatusId) reactions.removeStatusIds.add(rule.removeStatusId);
		reactions.criticalInteraction ||= Boolean(rule.criticalInteraction);
	}
	multiplier = clamp(
		multiplier,
		COMBAT_EFFECTIVENESS.minimumMultiplier,
		COMBAT_EFFECTIVENESS.maximumMultiplier
	);
	return Object.freeze({
		applyStatusIds: [...reactions.applyStatusIds],
		baseDamage: Math.max(0, Number(request.baseDamage || 0)),
		criticalInteraction: reactions.criticalInteraction,
		damage: Math.max(0, Math.round(Number(request.baseDamage || 0) * multiplier)),
		diagnostics,
		multiplier,
		removeStatusIds: [...reactions.removeStatusIds],
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

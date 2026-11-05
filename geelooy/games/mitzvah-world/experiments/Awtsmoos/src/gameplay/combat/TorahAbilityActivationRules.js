// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityActivationRules.js
 * @description Pure preflight rules shared by ability execution, slots, and tooltips.
 */

const ENEMY_TARGET_TYPES = new Set(['chain', 'line', 'selected-enemy']);

export function evaluateTorahAbilityActivation(definition, state = {}) {
	if (!definition) return rejected('unknown-ability');
	if (state.enabled === false) return rejected('disabled');
	if (state.unlocked === false) return rejected('not-unlocked');
	if (state.activeCast) return rejected('already-casting');
	if (state.cooldown?.ok === false) return rejected(state.cooldown.reason, state.cooldown.state);
	if (Number(state.resource ?? Infinity) < definition.resourceCost) return rejected('insufficient-resource');
	if (definition.castType === 'reactive' && !state.reactiveWindow) return rejected('no-reactive-window');
	const target = targetFor(definition.targetType, state);
	if (requiresTarget(definition.targetType) && !target) return rejected('no-target');
	if (definition.targetType === 'ground-point' && !state.groundPoint) return rejected('no-ground-point');
	if (ENEMY_TARGET_TYPES.has(definition.targetType) && target?.attackable === false) {
		return rejected('invalid-target');
	}
	if (definition.targetType === 'selected-ally' && target?.friendly === false) {
		return rejected('invalid-target');
	}
	const distance = Number(state.distance ?? target?.distance);
	if (definition.range > 0 && Number.isFinite(distance) && distance > definition.range) {
		return rejected('out-of-range', { distance, range: definition.range });
	}
	if (requiresFacing(definition.targetType) && state.facing === false) return rejected('not-facing');
	return { ok: true, reason: 'ready', target };
}

function targetFor(targetType, state) {
	if (targetType === 'selected-ally') return state.ally || state.target || null;
	if (ENEMY_TARGET_TYPES.has(targetType)) return state.target || null;
	return null;
}

function requiresTarget(targetType) {
	return ENEMY_TARGET_TYPES.has(targetType) || targetType === 'selected-ally';
}

function requiresFacing(targetType) {
	return ENEMY_TARGET_TYPES.has(targetType) || targetType === 'cone' || targetType === 'line';
}

function rejected(reason, detail = null) {
	return { detail, ok: false, reason };
}

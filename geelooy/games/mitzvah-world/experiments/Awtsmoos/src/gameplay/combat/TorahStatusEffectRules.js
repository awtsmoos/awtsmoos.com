// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahStatusEffectRules.js
 * @description Pure creation, refresh, boss scaling, and bounded tick rules for status instances.
 */

const MAXIMUM_CATCH_UP_TICKS = 4;

export function createStatusInstance(definition, request, now, sequence) {
	return {
		bossScale: bossScale(definition, request.isBoss),
		definition,
		expiresAt: now + definition.durationMilliseconds,
		nextTickAt: definition.tickIntervalMilliseconds ? now + definition.tickIntervalMilliseconds : Infinity,
		sequence,
		sourceId: request.sourceId,
		stacks: 1,
		strength: request.strength ?? 1,
		targetId: request.targetId
	};
}

export function refreshStatusInstance(instance, request, now) {
	const definition = instance.definition;
	const strength = request.strength ?? 1;
	if (definition.refreshRule === 'replace-stronger' && strength < instance.strength) {
		return { ok: false, reason: 'weaker-effect' };
	}
	if (definition.stackingRule === 'add') {
		instance.stacks = Math.min(definition.maximumStacks, instance.stacks + 1);
	}
	instance.expiresAt = now + definition.durationMilliseconds;
	instance.sourceId = request.sourceId;
	instance.strength = Math.max(instance.strength, strength);
	return { ok: true, reason: 'refreshed' };
}

export function statusTickPlan(instance, now) {
	const interval = instance.definition.tickIntervalMilliseconds;
	if (!interval || now < instance.nextTickAt) return null;
	const pending = Math.floor((now - instance.nextTickAt) / interval) + 1;
	const count = Math.min(pending, MAXIMUM_CATCH_UP_TICKS);
	instance.nextTickAt = pending > count ? now + interval : instance.nextTickAt + count * interval;
	return { count, dropped: pending - count };
}

export function statusEffectSnapshot(instance) {
	return {
		bossScale: instance.bossScale,
		effectId: instance.definition.id,
		expiresAt: instance.expiresAt,
		modifiers: instance.definition.modifiers,
		sequence: instance.sequence,
		sourceId: instance.sourceId,
		stacks: instance.stacks,
		strength: instance.strength,
		targetId: instance.targetId
	};
}

function bossScale(definition, isBoss) {
	if (!isBoss) return 1;
	if (definition.bossBehavior === 'half-strength') return 0.5;
	if (definition.bossBehavior === 'reveal-only') return 0;
	return 1;
}

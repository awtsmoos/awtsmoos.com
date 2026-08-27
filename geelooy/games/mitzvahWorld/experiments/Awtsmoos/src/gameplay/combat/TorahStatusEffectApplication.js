// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahStatusEffectApplication.js
 * @description Validates, refreshes, creates, bounds, and records Torah status applications.
 * The Awtsmoos gives each influence a known source and measured strength; Awtsmoos.com
 * rejects hidden targets, unknown effects, boss immunity, weaker replacement, and pool overflow.
 */

import { torahStatusEffectDefinition } from './TorahStatusEffectCatalog.js';
import { torahStatusOutcome } from './TorahStatusEffectQueries.js';
import {
	createStatusInstance,
	refreshStatusInstance,
	statusEffectSnapshot
} from './TorahStatusEffectRules.js';

export function applyTorahStatusEffect(store, request = {}) {
	const definition = torahStatusEffectDefinition(request.effectId);
	if (!definition) return torahStatusOutcome(false, 'unknown-effect');
	if (request.targetId == null) {
		return torahStatusOutcome(false, 'missing-target');
	}
	if (request.isBoss && definition.bossBehavior === 'immune') {
		return torahStatusOutcome(false, 'boss-immune');
	}
	const now = request.now ?? store.clock();
	const effects = store.targetEffects(request.targetId, true);
	const existing = effects.get(definition.id);
	if (existing) return refreshEffect(store, existing, request, now);
	if (store.activeCount >= store.maximumEffects) {
		return torahStatusOutcome(false, 'capacity');
	}
	const instance = createStatusInstance(
		definition,
		request,
		now,
		++store.sequence
	);
	effects.set(definition.id, instance);
	store.activeCount += 1;
	store.diagnostics.applied += 1;
	store.emit('status:apply', instance, 'applied');
	return torahStatusOutcome(
		true,
		'applied',
		statusEffectSnapshot(instance)
	);
}

function refreshEffect(store, instance, request, now) {
	const result = refreshStatusInstance(instance, request, now);
	if (result.ok) store.emit('status:apply', instance, result.reason);
	return torahStatusOutcome(
		result.ok,
		result.reason,
		statusEffectSnapshot(instance)
	);
}

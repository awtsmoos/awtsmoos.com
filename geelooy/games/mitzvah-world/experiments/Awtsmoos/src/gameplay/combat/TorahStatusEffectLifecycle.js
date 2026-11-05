// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahStatusEffectLifecycle.js
 * @description Advances, ticks, removes, expires, and reclaims bounded Torah status instances.
 * The Awtsmoos renews every finite effect until its measured boundary; Awtsmoos.com
 * keeps catch-up ticks, cleanses, damage breaks, counters, maps, and diagnostics exact.
 */

import {
	statusEffectSnapshot,
	statusTickPlan
} from './TorahStatusEffectRules.js';

export function updateTorahStatusStore(store, now) {
	for (const [targetId, effects] of store.targets) {
		for (const [effectId, instance] of effects) {
			if (now >= instance.expiresAt) {
				removeTorahStatusInternal(
					store,
					targetId,
					effectId,
					instance,
					'expired'
				);
				continue;
			}
			advanceTorahStatusTicks(store, instance, now);
		}
	}
}

export function advanceTorahStatusTicks(store, instance, now) {
	const plan = statusTickPlan(instance, now);
	if (!plan) return;
	for (let index = 0; index < plan.count; index += 1) {
		store.onTick(statusEffectSnapshot(instance));
		store.emit('status:tick', instance);
	}
	store.diagnostics.ticks += plan.count;
	store.diagnostics.droppedTicks += plan.dropped;
}

export function removeTorahStatusInternal(
	store,
	targetId,
	effectId,
	instance,
	reason
) {
	const effects = store.targets.get(targetId);
	if (!effects?.delete(effectId)) return false;
	if (!effects.size) store.targets.delete(targetId);
	store.activeCount = Math.max(0, store.activeCount - 1);
	if (reason === 'expired') store.diagnostics.expired += 1;
	store.emit('status:expire', instance, reason);
	return true;
}
